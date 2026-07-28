import express from "express";
import upload from "../middleware/multer.js";
import auth from "../middleware/auth.js"; 
import { addCategorie, getCategories, updateCategorie, deleteCategorie } from "../controller/categorieController.js"; 

const categorieRouter = express.Router();

// Route publique
categorieRouter.get("/", getCategories);

// Routes Admin
categorieRouter.post("/add", auth(['admin']), upload.single("image"), addCategorie);
categorieRouter.put("/update/:id", auth(['admin']), upload.single("image"), updateCategorie);
categorieRouter.delete("/delete/:id", auth(['admin']), deleteCategorie);

export default categorieRouter;