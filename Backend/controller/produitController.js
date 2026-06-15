import produitModel from '../models/produitModel.js';
import { v2 as cloudinary } from 'cloudinary';
import slugify from 'slugify';

// Ajouter un produit 
// Ajouter un produit 
const addproduit = async (req, res) => {
    try {
        const { nom, description, prix, categorie, matiere, sizes, meilleurVente } = req.body;
        
        const image1 = req.files && req.files.image1 && req.files.image1[0];
        const image2 = req.files && req.files.image2 && req.files.image2[0];
        const image3 = req.files && req.files.image3 && req.files.image3[0];
        const image4 = req.files && req.files.image4 && req.files.image4[0];

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { 
                    resource_type: 'image',
                    folder: 'arilona_bijoux' 
                });
                return result.secure_url;
            })
        );
        
        const slug = slugify(nom, {
            lower: true,      
            strict: true,     
            remove: /[*+~.()'"!:@]/g 
        });

        // 🌟 SÉCURISATION ET NETTOYAGE DU TABLEAU DE TAILLES
        let parsedSizes = [];
        if (sizes) {
            try {
                // Si c'est déjà un vrai tableau (fourni par certains parsers), on le garde
                if (Array.isArray(sizes)) {
                    parsedSizes = sizes;
                } else {
                    // Sinon, on nettoie les éventuels guillemets superflus avant le JSON.parse
                    const cleanSizes = typeof sizes === 'string' ? sizes.trim() : sizes;
                    parsedSizes = JSON.parse(cleanSizes);
                }
            } catch (e) {
                // Si le JSON.parse échoue à cause du format FormData, on tente une séparation par virgule
                if (typeof sizes === 'string') {
                    parsedSizes = sizes.replace(/[\[\]"]/g, '').split(',').map(s => s.trim()).filter(Boolean);
                }
            }
        }

        const produitData = {
            nom,
            description, 
            prix: Number(prix),
            categorie, 
            matiere,
            sizes: parsedSizes, // 🌟 On utilise notre tableau nettoyé et garanti
            meilleurVente: meilleurVente === "true" || meilleurVente === true,
            image: imagesUrl, 
            slug: slug
        };

        const produit = new produitModel(produitData);
        await produit.save();
        
        res.status(201).json({ success: true, message: "Produit ajouté avec succès !" });
    } catch (error) {
        console.error("Erreur serveur lors de l'ajout :", error); // Ajout d'un log pour débugger dans ta console terminal
        res.status(500).json({ success: false, message: error.message });
    }
};  

// Récupérer les produits avec option de filtrage + populate
const listproduits = async (req, res) => {
    try {
        const { categorieId } = req.query; 
        
        let filtre = {};
        if (categorieId) {
            filtre.categorie = categorieId;
        }

        const produits = await produitModel.find(filtre).populate("categorie");
        res.status(200).json({ success: true, produits });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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

// 🗑️ CONTRÔLEUR DE SUPPRESSION AVEC DIAGNOSTIC CLOUDINARY
const removeproduit = async (req, res) => {
  try {
    const { id } = req.params; 

    // 1. Trouver le produit AVANT de le supprimer pour récupérer ses images
    const produit = await produitModel.findById(id);

    if (!produit) {
      return res.status(404).json({ success: false, message: "Produit introuvable" });
    }

    console.log(`=== Début de la suppression du produit : ${produit.nom} ===`);

    // 2. Nettoyage physique dans Cloudinary
    if (produit.image && produit.image.length > 0) {
      for (const imageUrl of produit.image) {
        const publicId = getPublicIdFromUrl(imageUrl);
        
        console.log(`URL brute : ${imageUrl}`);
        console.log(`Public ID extrait : ${publicId}`);

        if (publicId) {
          // On attend la réponse de Cloudinary pour être sûr
          const cloudResponse = await cloudinary.uploader.destroy(publicId);
          console.log(`Réponse Cloudinary pour ${publicId} :`, cloudResponse);
        } else {
          console.warn(`Impossible d'extraire le Public ID pour l'URL : ${imageUrl}`);
        }
      }
    }

    // 3. Suppression de la fiche dans MongoDB
    await produitModel.findByIdAndDelete(id);

    console.log(`=== Produit ${id} supprimé avec succès de MongoDB ===`);

    res.status(200).json({ success: true, message: "Bijou et ses images supprimés avec succès !" });

  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Récupérer un seul produit (avec détails catégorie)
const singleproduit = async (req, res) => {
    try {
        const { id } = req.params;
        const produit = await produitModel.findById(id).populate("categorie");

        if (!produit) {
            return res.status(404).json({ success: false, message: "Produit introuvable" });
        }

        res.status(200).json({ success: true, produit });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Modifier un produit
const updateproduit = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, description, prix, categorie, matiere, sizes, meilleurVente } = req.body;

        const updateData = {
            nom,
            description,
            prix: prix ? Number(prix) : undefined,
            categorie, 
            matiere,
            meilleurVente: meilleurVente !== undefined ? meilleurVente === "true" : undefined
        };

        if (sizes) {
            updateData.sizes = JSON.parse(sizes);
        }

        if (req.files && Object.keys(req.files).length > 0) {
            const image1 = req.files.image1 && req.files.image1[0];
            const image2 = req.files.image2 && req.files.image2[0];
            const image3 = req.files.image3 && req.files.image3[0];
            const image4 = req.files.image4 && req.files.image4[0];

            const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

            if (images.length > 0) {
                let imagesUrl = await Promise.all(
                    images.map(async (item) => {
                        let result = await cloudinary.uploader.upload(item.path, { 
                            resource_type: 'image',
                            folder: 'arilona_bijoux'
                        });
                        return result.secure_url;
                    })
                );
                updateData.image = imagesUrl;
            }
        }

        const produitModifie = await produitModel.findByIdAndUpdate(
    id, 
    updateData, 
    { returnDocument: 'after' } // Dit à Mongoose de renvoyer le document APRÈS modification
).populate("categorie");

        if (!produitModifie) {
            return res.status(404).json({ success: false, message: "Produit introuvable" });
        }

        res.status(200).json({ success: true, message: "Produit modifié avec succès !", produit: produitModifie });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Rechercher des produits
const searchProduits = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.json({ success: false, message: "Veuillez entrer un mot clé" });
        }

        const resultats = await produitModel.find(
            { $text: { $search: query } }
        )
        .populate("categorie") 
        .sort({ score: { $meta: "textScore" } }); 

        res.json({ success: true, produits: resultats });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Erreur lors de la recherche" });
    }
};

export { addproduit, listproduits, removeproduit, singleproduit, updateproduit, searchProduits };