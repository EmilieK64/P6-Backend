//Création d'un router pour implémenter les routes que nous importons dans l'application. Ce fichier contient la logique de nos routes user.
const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');

//definition des routes avec router.get('/', userCtrl.signUp); (req, res, next))... , on modifie le chemin en enlevant le début du chemin /api/user dans la parenthèse de chaque route



//Export du router de ce fichier
module.exports = router;