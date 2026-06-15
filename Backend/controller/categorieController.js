import categorieModel from "../models/categorieModel.js";
import { v2 as cloudinary } from 'cloudinary'; // 🛠️ Import direct de la v2 de Cloudinary
import slugify from 'slugify';

// 1. AJOUTER une catégorie avec image Cloudinary (Create)
export const addCategorie = async (req, res) => {
    try {
        const { nom } = req.body;
        const imageFile = req.file; 

        if (!imageFile) {
            return res.status(400).json({ success: false, message: "Une image est requise pour la catégorie" });
        }

        // 🛠️ Connexion directe à l'uploader v2
        const uploadResult = await cloudinary.uploader.upload(imageFile.path, {
            folder: 'arilona_bijoux',
            resource_type: "image"
        });

        const nouvelleCategorie = new categorieModel({ 
            nom, 
            image: uploadResult.secure_url,
            slug: slugify(nom, {
                lower: true,
                strict: true,
                remove: /[*+~.()'"!:@]/g
            })
        });


        await nouvelleCategorie.save();
        res.status(201).json({ success: true, message: "Catégorie ajoutée avec succès !", data: nouvelleCategorie });

    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur lors de l'ajout", error: error.message });
    }
};


// 2. RÉCUPÉRER toutes les catégories (Read)
export const getCategories = async (req, res) => {
    try {
        const categories = await categorieModel.find({});
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur de récupération", error: error.message });
    }
};

// 3. MODIFIER une catégorie (Update)
export const updateCategorie = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom } = req.body;
        const imageFile = req.file;

        let donneesMiseAJour = { nom };

        // Si l'utilisateur a choisi une NOUVELLE image, on l'uploade sur Cloudinary
        if (imageFile) {
            const uploadResult = await cloudinary.uploader.upload(imageFile.path, {
               folder: 'arilona_bijoux',
                resource_type: "image"
            });
            donneesMiseAJour.image = uploadResult.secure_url;
        }

        const categorieModifiee = await categorieModel.findByIdAndUpdate(
            id, 
            donneesMiseAJour, 
            { new: true }
        );
        
        res.status(200).json({ success: true, message: "Catégorie mise à jour !", data: categorieModifiee });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur lors de la modification", error: error.message });
    }
};
// Fonction pour extraire proprement le public_id de Cloudinary depuis une URL complète
const getPublicIdFromUrl = (url) => {
  try {
    if (!url) return null;
    
    // Découpe l'URL pour isoler la partie après '/upload/'
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    
    // On retire la version (ex: v17234567/) si elle est présente
    let publicIdWithExtension = parts[1];
    if (publicIdWithExtension.startsWith('v')) {
      const remainingParts = publicIdWithExtension.split('/');
      remainingParts.shift(); // Supprime le segment de version 'vXXXXXX'
      publicIdWithExtension = remainingParts.join('/');
    }
    
    // Supprime l'extension du fichier (.jpg, .png, etc.)
    const publicId = publicIdWithExtension.split('.').slice(0, -1).join('.');
    
    return publicId;
  } catch (error) {
    console.error("Erreur extraction publicId:", error);
    return null;
  }
};

// 4. SUPPRIMER une catégorie et son image Cloudinary
export const deleteCategorie = async (req, res) => {
    try {
        const { id } = req.params;
      
        // 1. Trouver la catégorie pour récupérer l'URL de son image
        const categorie = await categorieModel.findById(id);
        
        if (!categorie) {
            return res.status(404).json({ success: false, message: "Catégorie introuvable" });
        }

        // 2. Si la catégorie possède une image, on la détruit sur Cloudinary
        if (categorie.image) {
            const publicId = getPublicIdFromUrl(categorie.image);
            
            if (publicId) {
                console.log(`Suppression de l'image catégorie Cloudinary : ${publicId}`);
                await cloudinary.uploader.destroy(publicId);
            }
        }
        
        // 3. Suppression de l'entrée dans MongoDB
        await categorieModel.findByIdAndDelete(id);
        
        res.status(200).json({ success: true, message: "Catégorie et son image supprimées avec succès ! ✨" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur lors de la suppression", error: error.message });
    }
};