//Pour vérifier le token envoyé par le front, permettre uniquement à des requêtes authentifiées de réussir et ainsi protéger les routes sensibles de l'application. Pour vérifier les informations d'authentification envoyées par le client. Middleware qui récupère le token envoyé par le client, en vérifie la validité et permet aux différentes routes d'en exploiter les différentes informations telles que le userId.

const jwt = require('jsonwebtoken');
require('dotenv').config();
 
// Extrait les informations contenus dans le token, vérifie que le token est valide, pour aussi les transmettre aux autres middlewares et gestionnaires de routes. Va être importé dans le router pour être exécuté avant les gestionnaires de routes
module.exports = (req, res, next) => {
    //Try, catch pour gérer les erreurs et savoir d'où vient le problème éventuel
   try {
    // Nous récupérons le header et nous le splitons (= diviser la chaîne de caractère en un tableau autour de l'espace vide, entre le mot clé bearer et le token pour récupérer le token qui est après le mot clé bearer.
       const token = req.headers.authorization.split(' ')[1];
       //La fonction vérify de jwt auquel est passé le token récupéré et la clé secrète en arguments, décode le token qui est encodé.
       const decodedToken = jwt.verify(token, process.env.SECRET);
       //Nous extrayons du token l'id utilisateur
       const userId = decodedToken.userId;
       //que nous rajoutons à l’objet Request afin que nos différentes routes puissent l’exploiter. Nous créons l'objet auth.
       req.auth = {
           userId: userId
       };
	next();
    // Erreur pour décoder le token
   } catch(error) {
       res.status(401).json({ error });
   }
};

