import mongoose from "mongoose";

const produitSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    description: { type: String, required: true },
    prix: { type: Number, required: true },
    image: { type: Array, required: true },
    categorie: { type: String, required: true },
    matiere: { type: String }, // Ex: Or, Argent, Diamant
    sizes: { type: Array, required: true },
    slug: { type: String, required: true, unique: true },
    meilleurVente: { type: Boolean, default: false }
},{ timestamps: true });

// ✨ LA MAGIE EST ICI : On crée l'index textuel sur les champs textuels.
// Les poids (weights) disent à MongoDB que le "nom" est plus important que la description.
produitSchema.index(
    { nom: "text", description: "text", matiere: "text" },
    { weights: { nom: 10, matiere: 5, description: 1 } }
);

const produitModel = mongoose.models.produit || mongoose.model("produit", produitSchema);

export default produitModel;