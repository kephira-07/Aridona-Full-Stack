import mongoose from "mongoose";

const categorieSchema = new mongoose.Schema({
    nom: { 
        type: String, 
        required: [true, "Le nom de la catégorie est obligatoire"], 
        unique: true, 
        trim: true 
    },
    image: { 
        type: String, 
        required: [true, "L'image de la catégorie est obligatoire"] 
    },
    slug: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        index: true 
    }
}, { timestamps: true });

const categorieModel = mongoose.models.categorie || mongoose.model("categorie", categorieSchema);

export default categorieModel;