//Création d'un router pour implémenter les routes que nous importons dans l'application. Ce fichier contient la logique de nos routes user.
const express = require('express');
const router = express.Router();


//Associer les fonctions aux différentes routes
const userCtrl = require('../controllers/user');

//definition de 2 routes post puisque le frontend enverra email et mot de passe, on enlève le début du chemin.
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);


//Export du router de ce fichier
module.exports = router;