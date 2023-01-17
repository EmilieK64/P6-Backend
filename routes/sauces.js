// On a besoin du package express pour créer le routeur
const express = require('express');
// On créé le routeur via la méthode Router() d'express
const router = express.Router();
// Import du middleware auth.js qui transmet via la requête le user id
const auth = require('../middleware/auth');
// Import de la config multer
const multer = require('../middleware/multer-config');
// On importe le controller
const saucesController = require('../controllers/sauces');

router.post('/', auth, multer, saucesController.createSauce);

// On modifie le middleware get pour récupérer dynamiquement toutes les sauces
router.get('/', auth, saucesController.getAllSauces);

// Ajout d'une route pour renvoyer une sauce spécifique (via son id)
// On utilise la méthode GET sur ce nouveau middleware
// :id car cette partie de la route est dynamique
router.get('/:id', auth, saucesController.getOneSauce);

// Ajout d'une route pour modifier (update) une sauce (via son id)
// On utilise la méthode PUT sur ce nouveau middleware
router.put('/:id', auth, multer, saucesController.modifySauce);

// Ajout d'une route pour supprimer une sauce (via son id)
// On utilise la méthode DELETE sur ce nouveau middleware
router.delete('/:id', auth, multer, saucesController.deleteSauce);

// Ajout d'une route pour gérer les likes et dislkes d'une sauce (via son id)
// On utilise la méthode POST sur ce nouveau middleware
router.post('/:id/like', auth, multer, saucesController.likeOrDislikeSauce);

// On exporte le router pour pouvoir l'utiliser
module.exports = router;