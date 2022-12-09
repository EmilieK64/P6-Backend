//ETAPE 1 : installation d'express et mongoose 

// Import d'express qui va nous permettre de développer l'API plus facilement et créer nos routes
const express = require ('express');

// Import de mongoose qui va nous permettre d'interagir avec la base de données noSQL MongoDB pour créer de vraies routes fonctionnelles avec persistance de données. Les données sont stockées comme des collections de documents individuels décrits en JSON. Il n'y a pas de schéma strict de données (évolutivité et flexibilité). Mongoose permet notamment de valider les formats de données.
const mongoose = require('mongoose');

const userRoutes = require('./routes/user');

//Connexion à la BDD MongoDB
mongoose.connect('mongodb+srv://EmilieK64:cGWvnEeEVbynz92q@cluster0.rcqvkui.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));
  
//Création de l'application express
const app = express(); 

// Paramétrage de la sécurité liée au CORS pour permettre à tous les utilisateurs depuis le navigateur et l'application (localhost:4200) d'accéder à notre API (localhost:3000). Nous ajoutons donc des entêtes, headers sur l'objet réponse. Ce middleware sera appliqué à toutes les requêtes, routes, d'où app.use.
app.use((req, res, next) => {
    // tout le monde * peut accéder.
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    // autorisation d'utiliser certaines entêtes dans la requête
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); 
    // autorisation d'utiliser des verbes de requêtes.
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next(); 
  });

// Middleware qui intercepte toutes les requêtes contenant du JSON
// (contenu disponible dans le body de la requête : req.body)
app.use(express.json());


//Après avoir passé Express au serveur Node dans server.js et précisé le port : création des routes avec app.use (middleware d'Express). 
//Next est une fonction en plus des 2 objets précédents passés en argument qui renvoie au middleware suivant l'exécution du serveur.
//app.use('/api/user', userRoutes);


// Export de l'application express pour l'utiliser notamment pour notre serveur node dans server.js
module.exports = app; 