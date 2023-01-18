const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const passwordValidator = require('password-validator');
const emailValidator = require('email-validator');
require('dotenv').config();

//logique d'authentification avec le cryptage du mot de passe et contrôle du mot de passe et l'utilisation du modèle User qui utilise Unique Validator de Mongoose (et unique : true) pour le mot de pass
exports.signup = (req, res, next) => {
    const passwordSchema = new passwordValidator();
      passwordSchema
      // lenght minimum : 8, max 10
      .is().min(8)
      .is().max(10)
      //doit avoir des lettres uppercase et lowercase
      .has().uppercase()
      .has().lowercase()
      .has().digits(1) //au moins un chiffre
      .is().not().oneOf(['Password', 'Password123', 'Test1234']); //blacklist ces valeurs
      if(passwordSchema.validate(req.body.password)) {
        console.log('Password valide');
        } else {
          return res.status(400).json({error : "Le mot de passe n'est pas assez fort :" + passwordSchema.validate('req.body.password', {list: true})});
        }
    if(emailValidator.validate(req.body.email)) {
      console.log('Email valide');
      } else {
        return res.status(400).json({error : "L'email n'est pas valide"});
      }
  //La fonction bcrypt.hash hash le mot de passe, on lui passe la le password du corps de la requête adressé par le frontend. 10 tours d'algorythmes sont suffisants pour sécuriser le mot de passe.
    bcrypt.hash(req.body.password, 10)
    //On récupère le hash qui va être enregistré dans la base de données.
      .then(hash => { 
        console.log('étape 1');
        console.log(req.body);
        //le body de la request contient les informations pour le nouveau User qui va être ajouté à la BDD; Pour l'exploiter : création d'une nouvelle instance du modèle User auquel est passé un objet qui contient les informations dont on a besoin. Va copier les champs du body de la request et va détailler les champs attendus : email et password
        const user = new User({
          email: req.body.email,
          password: hash
        });
        console.log('étape 2');
        console.log(user);
        //le user est enregistré avec la méthode .save dans la BDD
        user.save(console.log('étape 3'))
        //retourne une promise avec une réponse au frontent, sinon expiration de la requête
          .then(() =>
          //code 201 pour une bonne création de ressource
            res.status(201).json({ message: 'Utilisateur créé !' }))
            // error est le racourci de error : error
          .catch(error => res.status(400).json({ error }));
      })
      .catch(
        error => res.status(500).json({ error }));
  };

// Vérifie si un utilisateur existe dans la BDD et si le mot de passe transmis correspond à l'utilisateur et gère les cas d'erreur d'exécution de la requête au serveur, les erreurs de vérification du mot de passe avec bcrypt ainsi que les cas où l'utilisateur n'existe pas ou le cas où le mot de passe est incorrecte.
  exports.login = (req, res, next) => {
    // La méthode findOne de la class User du modèle mongoose va chercher dans la BDD 1 seul objet : email du corps de la requête en l'occurence.
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
              // L'utilisateur n'existe pas dans la BDD, mais message volontairement flou pour ne pas dire à l'utilisateur que le mail n'existe pas dans la BDD (fuite de données, RGPD)
                return res.status(401).json({message: 'Paire identifiant/mot de passe incorrecte' });
            }
            // Nous comparons le mot de passe transmis avec ce qui est stocké dans la BDD. L améthode compare de bcrypt compare une string avec un hash
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Paire identifiant/mot de passe incorrecte!' });
                    }
                    // Un objet est retourné avec le userId et un token pour authentifier les requêtes émises par la suite par le User
                    res.status(200).json({
                        userId: user._id,
                        //fonction de jsonwebtoken . sign qui prend comme 1er arguments le payload : données que l'on veut encoder dans le token. Le userId est encodé. Va servir à appliquer le bon userId à chaque objet pour ne pas pouvoir modifier des objets créés par les autres utilisateurs. 
                        token: jwt.sign(
                          //pour être sûr que la requête correspond bien au userId.
                            { userId: user._id },
                          // la méthode .sign utilise une clé secrète pour l'encodage
                            process.env.SECRET,
                          // expiration du token sous 24h
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        // Erreur d'exécution 500 serveur, de la BDD (pas quand l'utilisateur n'existe pas).
        .catch(error => res.status(500).json({ error }));
 };