import express from "express";
import rateLimit from "express-rate-limit";
import upload from "../middleware/multer.js";
import auth from "../middleware/auth.js"; 
import { addCategorie, getCategories, updateCategorie, deleteCategorie } from "../controller/categorieController.js"; 

const categorieRouter = express.Router();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: "Trop de requêtes. Réessayez plus tard." },
});

// Route publique
categorieRouter.get("/", apiLimiter, getCategories);

// Routes Admin
categorieRouter.post("/add", apiLimiter, auth(['admin']), upload.single("image"), addCategorie);
categorieRouter.put("/update/:id", apiLimiter, auth(['admin']), upload.single("image"), updateCategorie);
categorieRouter.delete("/delete/:id", apiLimiter, auth(['admin']), deleteCategorie);

export default categorieRouter;
