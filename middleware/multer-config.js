// Import du package multer
const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

// On créé un objet de config pour multer
// fonction diskStorage : on enregistre la config sur le disque
const storage = multer.diskStorage({
    // L'objet de config qu'on passe à diskStorage a besoin de deux éléments :
    // - la destination (cad où enregistrer les fichiers)
    // - le filename (cad le nom du fichier à utiliser)
    destination: (req, file, callback) => {     // destination attend 3 paramètres (cf doc sur le web, pas trivial...) 
        callback(null, 'images')                // 1er paramètre pour dire qu'il n'y a pas d'erreur, second pour emplacement des fichiers
    },
    filename: (req, file, callback) => {
        // On génère un nom pour le fichier via la méthode originalname de file
        // On en profite pour gérer les éventuels espaces en les remplaçant par un '_'
        // split met dans un array les mots séparés par un espace
        // join reprend tous les mots et reforme une string en "collant" les mots avec un underscore
        const name = file.originalname.split(' ').join('_');

        // On doit maintenant appliquer une extension au fichier
        // NB : on n'a pas accès à l'extension du fichier source envoyé par l'utilisateur
        // Par contre, on a accès à son MIME_TYPE (cad fichier.jpg ou fichier.png)
        // On va utiliser le MIME_TYPE pour générer l'extension du fichier
        // => On prépare un dictionnaire MIME_TYPE
        // L'extension sera l'élément du dictionnaire qui correspond au mimetype du fichier envoyé
        const extension = MIME_TYPES[file.mimetype];

        // On exécute la fonction callback pour générer le nom complet du fichier
        // Nom du fichier = name concaténé au timestamp concaténé au '.' plus l'extension
        callback(null, name + Date.now() + '.' + extension);
    }
});

// Export du middleware multer
// On passe à multer l'objet storage et on ajoute la précision qu'il n'y aura qu'un seul fichier et qu'il sera de type image
module.exports = multer({ storage }).single('image');

// TODO : gérer les routes pour ajouter ce middleware et gérer les fichiers entrants
// Pourquoi ? Parce que quand on ajoute un fichier à une requête, le format de la requête est modifié
