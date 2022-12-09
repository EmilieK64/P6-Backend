//ETAPE 2
//Nous implémentons un modèle de données strict avec mongoose du user dans la BDD. Le modèle va refléter les différents champs dont nous avons besoin dans la BDD.

//Import de mongoose
const mongoose = require('mongoose');

// Import du plugin mongoose-unique-validator
const uniqueValidator = require('mongoose-unique-validator');

//Définition du modèle de données avec ses champs pour le user
const userSchema = mongoose.Schema({
    email : { type: String, required: true, unique: true }, //unique avec true empêche plusieurs utilisateurs d'avoir le même email. Nous rajouterons tout de même le package unique validator pour éviter des erreurs par mongoDb
    password: { type: String, required: true },
});

//Nous appliquons mongoose-unique-validator à userSchema.
userSchema.plugin(uniqueValidator);

//Nous exportons le schéma ou modèle de données créé pour user :
module.exports = mongoose.model('user', userSchema);