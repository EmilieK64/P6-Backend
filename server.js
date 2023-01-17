//Import du package http de node. 
const http = require('http'); 

//Import de l'application Express du fichier app.js
const app = require('./app');

//Paramétrage pour plus de stabilité, la fonction renvoie un port valide 
const normalizePort = val => {
    const port = parseInt(val, 10);
  
    if (isNaN(port)) {
      return val;
    }
    if (port >= 0) {
      return port;
    }
    return false;
  };
  
  // La fonction normalizePort renvoie un port valide, qu'il soit fourni sous la forme d'un numéro ou d'une chaîne ; avec l'ajout d'un port par défaut également.
  const port = normalizePort(process.env.PORT || '3000');
  //Précision sur quel port doit tourner l'application express : on set le port.
  app.set('port', port);
  

  // La fonction errorHandler recherche les différentes erreurs et les gère de manière appropriée. Elle est ensuite enregistrée dans le serveur ;
  const errorHandler = error => {
    if (error.syscall !== 'listen') {
      throw error;
    }
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges.');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use.');
        process.exit(1);
        break;
      default:
        throw error;
    }
  };

  //Création du serveur en appelant la méthode createServeur du package http. Nous passons au serveur l'application express en argument car c'est une fonction qui va recevoir les requêtes, les analyser et faire une réponse spécifique. Le serveur utilise express et les routes spécifiées par express.
  const server = http.createServer(app);
  

  //L'écouteur d'évènements consigne le port ou le canal nommé sur lequel le serveur s'exécute dans la console.
  server.on('error', errorHandler);
  server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
    console.log('Listening on ' + bind);
  });

  //Le serveur écoute avec la méthode listen du serveur les requêtes envoyées en l'ocurrence sur le port 3000 et si non disponible sur un port par défaut précisé plus haut.C'est le canal nommé sur lequel le serveur s'exécute.
  server.listen(port);









