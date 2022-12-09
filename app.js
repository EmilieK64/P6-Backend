// Import d'express 
const express = require ('express');

//Création de l'application express
const app = express(); 

//Après avoir passé Express au serveur Node dans server.js et précisé le port : création des routes avec app.use (middleware d'Express). 
//Next est une fonction en plus des 2 objets précédents passés en argument qui renvoie au middleware suivant l'exécution du serveur.
app.use((req, res, next) => {
    // renvoie d'une message en json avec l'objet response et la méthode json
    res.json({ message : 'votre requête a bien été reçue'});
});

// Export de l'application express pour l'utiliser notamment pour notre serveur node dans server.js
module.exports = app; 