import express from "express";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js"; // 🔒 Ajout de la protection admin
import { addCategorie, getCategories, updateCategorie, deleteCategorie } from "../controller/categorieController.js"; // 🛠️ Dossier corrigé avec un "s"

const categorieRouter = express.Router();

// 🔓 Tout le monde peut lire les catégories
categorieRouter.get("/", getCategories);

// 🔒 Seul l'admin authentifié peut ajouter, modifier ou supprimer
categorieRouter.post("/add", adminAuth, upload.single("image"), addCategorie);
categorieRouter.put("/update/:id", adminAuth,  upload.single("image"), updateCategorie);
categorieRouter.delete("/delete/:id", adminAuth,  deleteCategorie);

export default categorieRouter;