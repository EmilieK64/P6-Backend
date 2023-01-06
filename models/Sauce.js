// Schéma de données pour toutes les sauces mises en vente dans notre application

const mongoose = require('mongoose');

// On créé le schéma de données (tous les champs d'une sauce, sans l'id qui est auto-généré par MongoDB) et on définit les champs et leur type
const sauceSchema = mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String, required: true },
    heat: { type: Number, required: true },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    usersLiked: { type: Array },
    usersDisliked: { type: Array },
});

// Pour pouvoir utiliser le schéma comme model, on exporte le model de mongoose
// model prend 2 paramètres : le nom du modèle et le schéma
module.exports = mongoose.model('Sauce', sauceSchema);

// Prochain step : interagir avec la BDD ;)

