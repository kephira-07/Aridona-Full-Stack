import mongoose from "mongoose";

const produitSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    description: { type: String, required: true },
    prix: { type: Number, required: true },
    image: { type: Array, required: true },
    categorie: { type: String, required: true },
    matiere: { type: String }, // Ex: Or, Argent
    sizes: { type: Array, required: true },
    slug: { type: String, required: true, unique: true },
    meilleurVente: { type: Boolean, default: false },
    enStock: { type: Boolean, default: true } // 👈 NOUVEAU : Par défaut le produit est en stock
},{ timestamps: true });

// Index textuel pour la recherche
produitSchema.index(
    { nom: "text", description: "text", matiere: "text" },
    { weights: { nom: 10, matiere: 5, description: 1 } }
);

const produitModel = mongoose.models.produit || mongoose.model("produit", produitSchema);

export default produitModel;