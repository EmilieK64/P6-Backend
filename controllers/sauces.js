// Import du modèle Sauce
const Sauce = require('../models/Sauce');
// Import du package fs (file system) pour gérer les actions sur le système de fichier (utile pour supprimer un fichier)
const fs = require('fs');

// On implémente la méthode pour créer une nouvelle objet Sauce
exports.createSauce = (req, res, next) => {
    // La requête est un JSON en forme de string
    // => il faut parser l'objet de la requête
    const sauceObject = JSON.parse(req.body.sauce);

    // On supprime l'id de l'objet (auto-généré par MongoDB)
    delete sauceObject._id;
    // On supprime l'id du user (car envoyé par le client, donc pas safe)
    delete sauceObject._userId; // on utilise le userId qui vient du token d'authentification (on est sûr qu'il est valide)

    // On créé l'objet
    const sauce = new Sauce({
        ...sauceObject,  // on récupère les champs de la requête
        userId: req.auth.userId,  // on récupère le userId du token
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`// on génère l'url de l'image via une propriété de l'objet requête : protocole (http) / nom hôte (localhost:3000) / images / nom_du_fichier
    });
     // On enregistre l'objet dans la base avec une promesse
    sauce.save()
    // on doit renvoyer une réponse dans le then sinon la requête expire
        .then(() => res.status(201).json({message: 'Sauce enregistrée en base !'}))
        .catch(error => res.status(400).json({error}));
};

exports.getAllSauces = (req, res, next) => {
    // Récupération de tous les modèles via find()
    Sauce.find()
        // On récupère le tableau des sauces de la base
        .then(sauces => res.status(200).json(sauces))   // tout se passe bien ici, code 200 et on retourne les sauces
        .catch(error => res.status(400).json({error})); // sinon code 400 et affichage de l'erreur
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id}) // cherche en base si une sauce existe avec l'id égal au paramètre fournit dans la requête (cad req.params.id)
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({error})); // erreur 404 (not found)
};

exports.modifySauce = (req, res, next) => {
    // On doit gérer 2 cas : le cas où il y a une modif avec ajout de fichier et le cas sans fichier
    // On créé un objet sauceObject qui teste si la requête contient un champ file (cad un fichier)
    const sauceObject = req.file ? {    // revient à if (req.file)
        ...JSON.parse(req.body.sauce),  // JSON.parse() transforme un objet stringifié en objet JS exploitable
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };    // s'il n'y a pas de fichier, alors on récupère direct le body de la requête

    delete sauceObject._userId; // on supprime le userId envoyé par le client
    Sauce.findOne({_id: req.params.id}) // on cherche en BDD l'objet via son id (envoyé dans la req)
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                // Si le user id qui veut modifier l'objet n'est pas celui qui l'a créé (et donc qu'on a en BDD), alors il n'est pas autorisé à le modifier
                res.status(401).json({message : 'Non autorisé'});
            } else {
                // Le user est bien le bon, on peut mettre à jour l'objet
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
    Sauce.findOne({_id: req.params.id}) // on cherche en BDD l'objet via son id (envoyé dans la req)
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                // Si le user id qui veut modifier l'objet n'est pas celui qui l'a créé (et donc qu'on a en BDD), alors il n'est pas autorisé à le modifier
                res.status(401).json({message : 'Non autorisé'});
            } else {
                // Le user est bien le bon, on peut supprimer l'objet
                // On supprime d'abord le fichier du système de fichier puis on exécute le callback
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
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