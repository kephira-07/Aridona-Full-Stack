import mongoose from "mongoose";

const categorieSchema = new mongoose.Schema({
    nom: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    slug: { type: String, required: true, unique: true }
}, { timestamps: true });

const categorieModel = mongoose.models.categorie || mongoose.model("categorie", categorieSchema);

export default categorieModel;