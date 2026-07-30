import categorieModel from "../models/categorieModel.js";
import produitModel from "../models/produitModel.js"; // 👈 Pour la gestion des bijoux orphelins
import { v2 as cloudinary } from 'cloudinary';
import slugify from 'slugify';
import fs from 'fs';

// Helper pour nettoyer le fichier temporaire créé par Multer
const cleanLocalFile = (file) => {
    if (file && file.path && fs.existsSync(file.path)) {
        try { 
            fs.unlinkSync(file.path); 
        } catch (error) { 
            console.error("Erreur nettoyage fichier temporaire:", error); 
        }
    }
};

// Helper pour extraire le public_id de Cloudinary
const getPublicIdFromUrl = (url) => {
    try {
        if (!url) return null;
        const parts = url.split('/upload/');
        if (parts.length < 2) return null;
        
        let publicIdWithExtension = parts[1];
        if (publicIdWithExtension.startsWith('v')) {
            const remainingParts = publicIdWithExtension.split('/');
            remainingParts.shift();
            publicIdWithExtension = remainingParts.join('/');
        }
        return publicIdWithExtension.split('.').slice(0, -1).join('.');
    } catch (error) {
        return null;
    }
};

// 1. AJOUTER UNE CATÉGORIE
export const addCategorie = async (req, res) => {
    try {
        const { nom } = req.body;
        const imageFile = req.file; 

        if (!nom) {
            cleanLocalFile(imageFile);
            return res.status(400).json({ success: false, message: "Le nom de la catégorie est requis" });
        }

        if (!imageFile) {
            return res.status(400).json({ success: false, message: "Une image est requise pour la catégorie" });
        }

        // Vérification des doublons
        const categorieExistante = await categorieModel.findOne({ nom: nom.trim() });
        if (categorieExistante) {
            cleanLocalFile(imageFile);
            return res.status(400).json({ success: false, message: "Une catégorie avec ce nom existe déjà" });
        }

        // Upload sur Cloudinary
        const uploadResult = await cloudinary.uploader.upload(imageFile.path, {
            folder: 'aridona/categories',
            resource_type: "image"
        });

        // Nettoyage disque local
        cleanLocalFile(imageFile);

        const slug = slugify(nom, {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g
        });

        const nouvelleCategorie = new categorieModel({ 
            nom: nom.trim(), 
            image: uploadResult.secure_url,
            slug
        });

        await nouvelleCategorie.save();
        return res.status(201).json({ success: true, message: "Catégorie ajoutée avec succès !", data: nouvelleCategorie });

    } catch (error) {
        cleanLocalFile(req.file);
        return res.status(500).json({ success: false, message: "Erreur lors de l'ajout", error: error.message });
    }
};

// 2. RÉCUPÉRER TOUTES LES CATÉGORIES
export const getCategories = async (req, res) => {
    try {
        const categories = await categorieModel.find({}).sort({ nom: 1 });
        return res.status(200).json({ success: true, data: categories });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Erreur de récupération", error: error.message });
    }
};

// 3. MODIFIER UNE CATÉGORIE
export const updateCategorie = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom } = req.body;
        const imageFile = req.file;

        const categorie = await categorieModel.findById(id);
        if (!categorie) {
            cleanLocalFile(imageFile);
            return res.status(404).json({ success: false, message: "Catégorie introuvable" });
        }

        let donneesMiseAJour = {};

        // Mise à jour du nom et du slug
        if (nom && nom.trim() !== categorie.nom) {
            const nomNettoye = nom.trim();

            // Vérification des doublons (manquait ici, contrairement à addCategorie) — évite
            // une erreur Mongo brute (E11000) si le nouveau nom est déjà pris par une autre catégorie.
            const doublon = await categorieModel.findOne({ nom: nomNettoye, _id: { $ne: id } });
            if (doublon) {
                cleanLocalFile(imageFile);
                return res.status(400).json({ success: false, message: "Une catégorie avec ce nom existe déjà" });
            }

            donneesMiseAJour.nom = nomNettoye;
            donneesMiseAJour.slug = slugify(nomNettoye, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
        }

        // Si une NOUVELLE image est fournie
        if (imageFile) {
            // Upload de la nouvelle image
            const uploadResult = await cloudinary.uploader.upload(imageFile.path, {
                folder: 'aridona/categories',
                resource_type: "image"
            });
            donneesMiseAJour.image = uploadResult.secure_url;

            // Suppression de l'ANCIENNE image sur Cloudinary
            if (categorie.image) {
                const oldPublicId = getPublicIdFromUrl(categorie.image);
                if (oldPublicId) {
                    await cloudinary.uploader.destroy(oldPublicId);
                }
            }

            cleanLocalFile(imageFile);
        }

        const categorieModifiee = await categorieModel.findByIdAndUpdate(
            id, 
            donneesMiseAJour, 
            { new: true }
        );

        return res.status(200).json({ success: true, message: "Catégorie mise à jour avec succès !", data: categorieModifiee });
    } catch (error) {
        cleanLocalFile(req.file);
        return res.status(500).json({ success: false, message: "Erreur lors de la modification", error: error.message });
    }
};

// 4. SUPPRIMER UNE CATÉGORIE
export const deleteCategorie = async (req, res) => {
    try {
        const { id } = req.params;
      
        const categorie = await categorieModel.findById(id);
        if (!categorie) {
            return res.status(404).json({ success: false, message: "Catégorie introuvable" });
        }

        // 1. Vérification des produits associés pour éviter les objets orphelins —
        // DOIT précéder toute suppression Cloudinary, sinon l'image est perdue même
        // quand la catégorie elle-même est conservée (suppression refusée).
        const nombreProduits = await produitModel.countDocuments({ categorie: id });
        if (nombreProduits > 0) {
            return res.status(400).json({
                success: false,
                message: `Impossible de supprimer : ${nombreProduits} bijou(x) sont encore associés à cette catégorie.`
            });
        }

        // 2. Suppression de l'image sur Cloudinary
        if (categorie.image) {
            const publicId = getPublicIdFromUrl(categorie.image);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
            }
        }

        // 3. Suppression dans MongoDB
        await categorieModel.findByIdAndDelete(id);
        
        return res.status(200).json({ success: true, message: "Catégorie et son image supprimées avec succès !" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Erreur lors de la suppression", error: error.message });
    }
};