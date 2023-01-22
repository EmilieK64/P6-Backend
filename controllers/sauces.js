// Import du modèle Sauce
const Sauce = require('../models/Sauce');
// Import du package fs (file system) pour gérer les actions sur le système de fichier (utile pour supprimer un fichier. En effet en rajoutant mutler sur les routes, le format de la requête va avoir changé.
//Adaptation faite de la fonction createSauce et rajout dans app.js d'une route pour les images.
const fs = require('fs');

// On implémente la méthode pour créer une nouvelle objet Sauce
exports.createSauce = (req, res, next) => {
    // La requête est un JSON en forme de string
    // => il faut parser l'objet de la requête
    const sauceObject = JSON.parse(req.body.sauce);

    // On supprime l'id de l'objet créé par l'utilisateur puisqu'il sera auto-généré par MongoDB
    delete sauceObject._id;
    // On supprime l'id du user (car envoyé par le client, donc pas sécure)
    // On utilisera le userId qui vient du token d'authentification (on est sûr qu'il est valide)
    delete sauceObject._userId; 

    // On créé l'objet en créant une nouvelle instance du modèle Sauce
    const sauce = new Sauce({
        // on récupère les champs de la requête contenu dans le corps de la requête sans les 2 champs supprimés en amont, req.body.sauce avec le raccourci opérateur spread pour l'ajouter à la BDD.
        ...sauceObject,  
        // on récupère le userId du token pour stocker la valeur de userId
        userId: req.auth.userId,  
        // on génère l'url de l'image via des propriétés de l'objet requête : le protocole http / nom hôte (localhost:3000) / images / nom_du_fichier donné par Multer. En effet Multer ne passe que le nom de fichier
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
     // On enregistre l'objet, nouvelle instance du modèle sauce récupéré du corps de la requête dans la base de donnée avec la méthode .save
    sauce.save()
    // on doit renvoyer une réponse dans le then sinon la requête expire
        .then(() => res.status(201).json({message: 'Sauce enregistrée !'}))
        // error est un racourci de error : error, l'erreur sera généré par Mongoose
        .catch(error => res.status(400).json({error}));
};

exports.getAllSauces = (req, res, next) => {
    // Récupération de la liste complète des détails des sauces dans la BDD avec la méthode find()
    Sauce.find()
        // On récupère le tableau des sauces de la base
        .then(sauces => res.status(200).json(sauces))   // tout se passe bien ici, code 200 et on retourne les sauces
        .catch(error => res.status(400).json({error})); // sinon code 400 et affichage de l'erreur
};

exports.getOneSauce = (req, res, next) => {
    console.log(req.params);
    Sauce.findOne({_id: req.params.id}) // cherche en base si une sauce existe avec l'id égale au paramètre de route dynamique id fournit dans la requête (cad req.params.id)
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({error})); // erreur 404 (not found)
};

exports.modifySauce = (req, res, next) => {
    // On doit gérer 2 cas : le cas où il y a une modif avec ajout de fichier et le cas sans fichier. Lorsque fichier transmis : réponse sous forme de chaîne de caractères, différent si pas de fichier transmis.
    // On créé un objet sauceObject qui teste si la requête contient un champ file (cad un fichier)?
    const sauceObject = req.file ? {    // revient à if (req.file), 
        ...JSON.parse(req.body.sauce),  // S'il y a un champs file : JSON.parse() transforme la chaîne de caractère en objet JS exploitable.
        //Et nous recréons l'URL de l'image.
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        // s'il n'y a pas de fichier, alors on récupère directement l'objet dans le body de la requête
    } : { ...req.body };    

    delete sauceObject._userId; // on supprime le userId envoyé par le client pour éviter qu'il crée un objet à son nom puis le modifie pour le réassigner à quelqu'un d'autre.. Sécurité.
    Sauce.findOne({_id: req.params.id}) // on cherche en BDD l'objet via son id qui doit correspondre au paramètres de routes
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                // Nous vérifions si le user (via son userId extrait du token est celui qui a créé l'objet. Si le champs userId de la BDD ne correspond au userId de notre token : le user veut modifier un objet qu'il n'a pas créé, alors il n'est pas autorisé à le modifier
                res.status(401).json({message : 'Non autorisé'});
            } else {
                // Le user est bien le bon, on peut mettre à jour l'objet
                // On met à jour l'enregistrement et donc nous passons le filtre qui indique quel est l'enregistrement à mettre à jour et avec quel objet qui ce que nous avons récupéré dans le corps de la fonction avec l'id qui vient des paramètres.
                Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
                .then(() => res.status(200).json({message: 'Object modifié !'}))
                .catch(error => res.status(400).json({error}));
            }
        })
        .catch((error) => {
            res.status(400).json({error});
        });
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id}) // on cherche en BDD l'objet via son id des paramètres de route
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                // Si le user id qui veut modifier l'objet n'est pas celui qui l'a créé (et donc qu'on a en BDD), alors il n'est pas autorisé à le modifier
                res.status(401).json({message : 'Non autorisé'});
            } else {
                // Le user est bien le bon, on peut supprimer l'objet
                // On supprime d'abord le fichier du système de fichiers, nous savons que le nom de fichier sera après dans l'URL.
                const filename = sauce.imageUrl.split('/images/')[1];
                //Avec la méthode unlink de fs et gestion du call back
                fs.unlink(`images/${filename}`, () => {
                    //Suppression de l'objet dans la base de données id correspondant à l'id du paramètre de la la route.
                    Sauce.deleteOne({_id: req.params.id})
                    .then(() => res.status(200).json({message: 'Object supprimé !'}))
                    .catch(error => res.status(401).json({error}));
                });
            }
        })
        .catch((error) => {
            res.status(400).json({error});
        });
};

exports.likeOrDislikeSauce = (req, res, next) => {
    // console.log(req.body);
    // console.log(req.body.userId);
    // console.log(req.body.like);
    Sauce.findOne({_id: req.params.id}) // on cherche en BDD l'objet via son id (envoyé dans la req)
        .then((sauce) => {
            // Cas où like vaut 1
            if (req.body.like == 1) {
                console.log(sauce.usersLiked);
                console.log(sauce.usersDisliked);
                // Si userId n'existe pas dans l'array usersLiked
                if (!sauce.usersLiked.includes(req.body.userId)) {
                    // On ajoute le user à l'array usersLiked
                    sauce.usersLiked.push(req.body.userId);
                    // On incrémente le compteur likes
                    sauce.likes++;
                    console.log('Like vaut 1');
                    console.log(sauce.usersLiked);
                    console.log(sauce.likes);
                    // On met à jour les données de la sauce
                    // $set permet de ne mettre à jour que les données souhaitées
                    Sauce.updateOne(
                        {_id: req.params.id},
                        {$set: {
                            "likes": sauce.likes,
                            "usersLiked": sauce.usersLiked
                            } 
                        })
                    .then(() => res.status(200).json({message: 'Likes modifiés !'}))
                    .catch(error => {
                        console.log('400');
                        res.status(400).json({error});
                    });
                }
                // Si userId existe dans l'array usersDisliked
                if (sauce.usersDisliked.includes(req.body.userId)) {
                    // On supprime le user à l'array usersLiked
                    const userIndex = sauce.usersDisliked.indexOf(req.body.userId);
                    sauce.usersDisliked.splice(userIndex, 1);
                    // On décrémente le compteur dislikes
                    if (sauce.dislikes != 0) {
                        sauce.dislikes--;
                    }
                    Sauce.updateOne(
                        {_id: req.params.id},
                        {$set: {
                            "dislikes": sauce.dislikes,
                            "usersDisliked": sauce.usersDisliked
                            } 
                        })
                    .then(() => res.status(200).json({message: 'Likes modifiés !'}))
                    .catch(error => {
                        console.log('400');
                        res.status(400).json({error});
                    });
                }
                return;
            }

            // Cas où like vaut 0
            if (req.body.like == 0) {
                console.log(sauce.usersLiked);
                console.log(sauce.usersDisliked);
                // Si userId existe pas dans l'array usersLiked
                if (sauce.usersLiked.includes(req.body.userId)) {
                    // On supprime le user à l'array usersLiked
                    const userIndex = sauce.usersLiked.indexOf(req.body.userId);
                    sauce.usersLiked.splice(userIndex, 1);
                    // On décrémente le compteur dislikes
                    if (sauce.likes != 0) {
                        sauce.likes--;
                    }
                    console.log('Like vaut 0');
                    console.log(sauce.usersLiked);
                    console.log(sauce.likes);
                    Sauce.updateOne(
                        {_id: req.params.id},
                        {$set: {
                            "likes": sauce.likes,
                            "usersLiked": sauce.usersLiked
                            } 
                        })
                    .then(() => res.status(200).json({message: 'Likes modifiés !'}))
                    .catch(error => {
                        console.log('400');
                        res.status(400).json({error});
                    });
                }
                // Si userId existe dans l'array usersDisliked
                if (sauce.usersDisliked.includes(req.body.userId)) {
                    // On supprime le user à l'array usersLiked
                    const userIndex = sauce.usersDisliked.indexOf(req.body.userId);
                    sauce.usersDisliked.splice(userIndex, 1);
                    // On décrémente le compteur dislikes
                    if (sauce.dislikes != 0) {
                        sauce.dislikes--;
                    }
                    Sauce.updateOne(
                        {_id: req.params.id},
                        {$set: {
                            "dislikes": sauce.dislikes,
                            "usersDisliked": sauce.usersDisliked
                            } 
                        })
                    .then(() => res.status(200).json({message: 'Likes modifiés !'}))
                    .catch(error => {
                        console.log('400');
                        res.status(400).json({error});
                    });
                }
                return;
            }

            // Cas où like vaut -1
            if (req.body.like == -1) {
                console.log(sauce.usersLiked);
                console.log(sauce.usersDisliked);
                // Si userId existe dans l'array usersLiked
                if (sauce.usersLiked.includes(req.body.userId)) {
                    // On supprime le user à l'array usersLiked
                    const userIndex = sauce.usersLiked.indexOf(req.body.userId);
                    sauce.usersLiked.splice(userIndex, 1);
                    // On décrémente le compteur dislikes
                    if (!sauce.likes == 0) {
                        sauce.likes--;
                    }
                    console.log('Like vaut -1');
                    console.log(sauce.usersLiked);
                    console.log(sauce.likes);
                    Sauce.updateOne(
                        {_id: req.params.id},
                        {$set: {
                            "likes": sauce.likes,
                            "usersLiked": sauce.usersLiked
                            } 
                        })
                    .then(() => res.status(200).json({message: 'Likes modifiés !'}))
                    .catch(error => {
                        console.log('400');
                        res.status(400).json({error});
                    });
                }
                // Si userId existe dans l'array usersDisliked
                if (!sauce.usersDisliked.includes(req.body.userId)) {
                    // On ajoute le user à l'array usersDisliked
                    sauce.usersDisliked.push(req.body.userId);
                    // On incrémente le compteur likes
                    sauce.dislikes++;
                    Sauce.updateOne(
                        {_id: req.params.id},
                        {$set: {
                            "dislikes": sauce.dislikes,
                            "usersDisliked": sauce.usersDisliked
                            } 
                        })
                    .then(() => res.status(200).json({message: 'Likes modifiés !'}))
                    .catch(error => {
                        res.status(400).json({error});
                    });
                }
                return;
            }
        })
        .catch((error) => {
            res.status(400).json({error});
        });
};