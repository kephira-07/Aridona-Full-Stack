import utilisateurModel from '../models/utilisateurModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};
// Récupérer le profil de l'utilisateur connecté
const getProfilUtilisateur = async (req, res) => {
    try {
        const userId = req.userId; // Injecté par ton middleware authUser
        const utilisateur = await utilisateurModel.findById(userId).select("-password");
        
        if (!utilisateur) {
            return res.json({ success: false, message: "Utilisateur introuvable." });
        }
        res.json({ success: true, utilisateur });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Mettre à jour le profil
const updateProfilUtilisateur = async (req, res) => {
    try {
        const userId = req.userId;
        const { name, telephone, adresse, ville } = req.body;

        const utilisateurMisAJour = await utilisateurModel.findByIdAndUpdate(
            userId,
            { name, telephone, adresse, ville },
            { new: true }
        ).select("-password");

        res.json({ success: true, message: "Profil mis à jour avec succès !", utilisateur: utilisateurMisAJour });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// N'oublie pas de les ajouter dans ton export final en bas du fichier :

// Inscription
const registerutilisateur = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const exists = await utilisateurModel.findOne({ email });
        if (exists) return res.json({ success: false, message: "Cet email est déjà utilisé." });
        if (!validator.isEmail(email)) return res.json({ success: false, message: "Email invalide." });
        if (password.length < 8) return res.json({ success: false, message: "Le mot de passe doit faire au moins 8 caractères." });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newutilisateur = new utilisateurModel({ name, email, password: hashedPassword });
        const utilisateur = await newutilisateur.save();
        const token = createToken(utilisateur._id);

        res.json({ success: true, token });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Connexion
const loginutilisateur = async (req, res) => {
    try {
        const { email, password } = req.body;
        const utilisateur = await utilisateurModel.findOne({ email });
        if (!utilisateur) return res.json({ success: false, message: "L'utilisateur n'existe pas." });

        const isMatch = await bcrypt.compare(password, utilisateur.password);
        if (isMatch) {
            const token = createToken(utilisateur._id);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Mot de passe incorrect." });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const adminLogin = async (req, res) => {
   try {
    const { email, password } = req.body;

    // 1. Vérification stricte de l'email admin
    if (email !== process.env.ADMIN_EMAIL) {
        return res.json({ success: false, message: "Email ou mot de passe incorrect." });
    }

const isMatch = (password === process.env.ADMIN_PASSWORD)
    

    if (isMatch) {
        // 🌟 CORRECTION : On intègre l'email et le rôle dans le token, et on met '7d' pour être tranquille
        const token = jwt.sign(
            { email: process.env.ADMIN_EMAIL, role: 'admin' }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' } 
        );
        return res.json({ success: true, token });
    } else {
        return res.json({ success: false, message: "Email ou mot de passe incorrect." });
    }

   } catch (error) {
    console.error("Erreur adminLogin:", error);
    return res.status(500).json({ success: false, message: "Une erreur interne est survenue." });
   }
}

export { registerutilisateur, loginutilisateur, adminLogin, getProfilUtilisateur, updateProfilUtilisateur };