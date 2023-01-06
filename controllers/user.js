const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
      .then(hash => { 
        console.log('étape 1');
        console.log(req.body);
        //le body de la request contient les informations pour le nouveau User qui va être ajouté à la BDD; Pour l'exlpoiter création d'une nouvelle instance du modèle User auquel est passé un objet qui contient les information dont on a besoin. Va copier les champs du body de la request et va détailler les champs attendus : email et password
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


  exports.login = (req, res, next) => {
    // La méthode findone du modèle mongoose va chercher dans la BDD 1 seul objet : email du corps de la requête en l'occurence.
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };