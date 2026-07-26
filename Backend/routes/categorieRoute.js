import express from "express";
import upload from "../middleware/multer.js";
import auth from "../middleware/auth.js"; 
import { addCategorie, getCategories, updateCategorie, deleteCategorie } from "../controller/categorieController.js"; 

const categorieRouter = express.Router();

const adminOnly = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: "Accès refusé. Droits administrateur requis." });
  }
  next();
};

// Route publique
categorieRouter.get("/", getCategories);

// Routes Admin
categorieRouter.post("/add", auth, adminOnly, upload.single("image"), addCategorie);
categorieRouter.put("/update/:id", auth, adminOnly, upload.single("image"), updateCategorie);
categorieRouter.delete("/delete/:id", auth, adminOnly, deleteCategorie);

export default categorieRouter;