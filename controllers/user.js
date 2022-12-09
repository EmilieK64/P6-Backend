//package de chiffrement pour hasher le mot de passe dans la base de donnée pour la fonction signup
const bcrypt = require('bcrypt');

//Séparation de la logique métiers des routes en controllers pour mieux comprendre et maintenir.
const User = require('../models/User');

exports.signup = (req, res, next) => {
    // 10 correspond aux tours de l'algorythmes, plus il y en a plus c'est sécurisé mais il ne faut pas non plus que cela ralentisse l'application
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};
// Vérifie si un utilisateur existe dans la base de donnée et si le mot de passe transmis par le client correspond à cet utilisateur, avec la méthode finOne.
// req.body.email est la valeur qui nous a été transmise par le client. 
//La fonction sait gérer l'absence d'utilisateur enregistré, si le mot de passe est incorrect, les erreurs d'exécution dans la base de données lié à la requête au serveur et à la vérification du mot de passe avec bcrypt.
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
    .then(user => {
        if (!user) {
            return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'}); //réponse floue pour ne pas dire au client que l'utilisateur n'est pas enregistré via son email(sécurité, RGPD) chez nous.
        }
        // compare le password (string) transmis par l'utilisateur et le hash dans la base de donnée
        bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if (!valid) {
                    return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' }); // si le mot de passe n'est pas correct. 
                }
                //Si le mot de passe est correct, transmission du userId et du token pour authentifier les requêtes.
                res.status(200).json({
                    userId: user._id,
                    token: 'TOKEN'
                });
            })
            .catch(error => res.status(500).json({ error })); // 500 pour erreur de vérification du mot de passe avec bcrypt
    })
    .catch(error => res.status(500).json({ error })); // 500 pour erreur d'exécution de la requête au serveur 
};