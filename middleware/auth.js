//Pour vérifier les informations d'authentification envoyées par le client. Middleware qui récupère le token envoyé par le client, en vérifie la validité et permet aux différentes routes d'n exploiter les différentes informations telles que le userId
const jwt = require('jsonwebtoken');
 
// Extrait les informations contenus dans le token, vérifie que le token est valide, pour aussi les transmettre aux autres middlewares et gestionnaires de routes. Va être importé dans le router pour être exécuté avant les gestionnaires de routes
module.exports = (req, res, next) => {
    //Try, catch pour gérer les erreurs et savoir d'où vient le problème éventuel
   try {
    // nous récupérons le header et nous le splitons (diviser la chaîne de caractère en un tableau autour de l'espace entre le mot clé et le token pour récupérer le token qui est après le mot clé
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};

