// Import d'express qui va nous permettre de développer l'API plus facilement et créer nos routes.
const express = require ('express');

// Import de mongoose qui va nous permettre d'interagir avec la base de données
const mongoose = require('mongoose');

const userRoutes = require('./routes/user');

const saucesRoutes = require('./routes/sauces');
// Helmet embarque 15 petits middleware pour améliorer la sécurité via les headers. Helmet aide à protéger l'application de certaines des vulnérabilités bien connues du Web en configurant de manière appropriée des en-têtes HTTP.
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Nous limitons chaque adresse IP à un max de 100 requêtes en 15 min
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes, en millisecondes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
// const express_enforces_ssl = require('express-enforces-ssl');

// Utilisation du module 'dotenv' pour masquer les informations de connexion à la base de données à l'aide de variables d'environnement
require('dotenv').config();

const path = require('path');

//Connexion à la BDD MongoDB
mongoose.connect(process.env.DB_URI,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));
  
//Création de l'application express en appelant la methode express().
const app = express(); 

// Pour permettre des requêtes cross-origin (et empêcher des erreurs CORS de sécurité), nous paramétrons la sécurité avec des headers spécifiques de contrôle d'accès pour tous les objets de réponse.Pour permettre à tous les utilisateurs depuis le navigateur et l'application (localhost:4200) d'accéder à notre API (localhost:3000) qui n'ont pas la même origine. C'est le 1er middleware, défini avant les routes, qui sera applicable à toutes les routes.
app.use((req, res, next) => {
    // tout le monde * peut accéder.
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    // autorisation d'utiliser certaines entêtes dans la requête. Il n'y a pas l’en-tête X-Powered-By. Les intrus peuvent utiliser cet en-tête (activé par défaut) afin de détecter les applications qui exécutent Express et lancer ensuite des attaques spécifiquement ciblées.
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); 
    // autorisation d'utiliser des verbes de requêtes.
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next(); 
  });
  //helmetjs.github.io, 
  //Bloque les tentatives d'utiliser du XSS
  app.use(helmet.xssFilter());
  //Evite le « ClickJacking ». Le principe est d’afficher une page illégitime (à l’intérieur d’une iframe). L’utilisateur pense interagir avec une page légitime, mais celle-ci est affichée dans une page contrôlée par l’attaquant
  app.use(helmet.frameguard());

  //La protection des communications. Définit l’en-tête Strict-Transport-Security qui impose des connexions (HTTP sur SSL/TLS) sécurisées au serveur.Force le navigateur à communiquer en HTTPS de manière privilégiée avec le serveur. Pour ce faire, il est nécessaire d’activer l’entête HTTP Strict Transport Security (ou HSTS pour les intimes). HSTS ne dit pas au navigateur de passer du HTTP au HTTPS. Il lui dit juste « Reste donc discuter avec moi en HTTPS pendant quelques instants ».
  sixtyDaysInSeconds = 5184000;
  app.use(helmet.hsts({maxAge: sixtyDaysInSeconds}));

  // app.use(express_enforces_ssl());

  //Empêche le navigateur de deviner le type du fichier. Le navigateur sinon peut analyser un fichier et décider de l’exécuter (si c'est un script par exemple)
  app.use(helmet.noSniff());

  // Apply the rate limiting middleware to all requests
  app.use(limiter)

// Middleware qui permet d'avoir accès au corps de la requête, intercepte toutes les requêtes contenant du JSON (content type)
// Contenu mis à disposition dans le body de la requête : req.body
app.use(express.json());

//Après avoir passé Express au serveur Node dans server.js et précisé le port : création des routes avec app.use (middleware d'Express) en précisant le endpoint pour interroger l'API. 
app.use('/api/auth', userRoutes);

// On créé une "route principale" qui centralise toutes les routes (cad point d'entrée des routes)
// On utilise le router saucesRoutes que l'on a importé pour la logique de toutes nos routes
// La string '/api/sauces' est l'url de base de toutes les routes => dans stuff.js, on supprime le préfixe api/stuff de toutes les routes
app.use('/api/sauces', saucesRoutes);

// Ajout d'une route pour gérer les images statiques
// express.static : fourni par Express, indique à Express qu'il faut gérer la ressource images de manière statique à chaque fois qu'elle reçoit une requête vers la route /image
// path.join(__dirname, 'images') : contient le chemin complet des images sur le disque
app.use('/images', express.static(path.join(__dirname, 'images'))); // on concatène _dirname avec le répertoire images (_dirname : répertoire dans lequel s'exécute le serveur)

// Export de l'application express pour l'utiliser notamment pour notre serveur node dans server.js
module.exports = app; 