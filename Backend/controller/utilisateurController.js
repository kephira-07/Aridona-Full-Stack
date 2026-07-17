import utilisateurModel from '../models/utilisateurModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { OAuth2Client } from 'google-auth-library';


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

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
    try {
        const { access_token } = req.body;

        if (!access_token) {
            return res.json({ success: false, message: "Token Google manquant." });
        }

        // 1. Récupérer les infos de l'utilisateur directement depuis l'API Google grâce à l'access_token
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
        const googleUser = await response.json();

        if (!googleUser.email) {
            return res.json({ success: false, message: "Impossible de récupérer les informations Google." });
        }

        const { email, name } = googleUser;

        // 2. Vérifier si l'utilisateur existe déjà dans ta base de données
        let user = await userModel.findOne({ email });

        if (!user) {
            // S'il n'existe pas, on lui crée un compte automatiquement
            // On lui génère un mot de passe aléatoire hautement sécurisé puisqu'il passe par Google
            const randomPassword = Math.random().toString(36).slice(-16) + 'Aa1!';
            
            user = new userModel({
                name,
                email,
                password: randomPassword, // Il sera hashé si tu as un middleware "pre-save" ou fais-le ici
                ville: 'Lomé' // Ville par défaut
            });
            await user.save();
        }

        // 3. Générer le token JWT de ton application (comme pour ton login classique)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ success: true, token });

    } catch (error) {
        console.error("Erreur lors de la connexion Google:", error);
        res.status(500).json({ success: false, message: "Erreur interne du serveur." });
    }
};
import crypto from 'crypto';
// Importe ton service d'envoi d'e-mail (ex: nodemailer)

const motDePasseOublie = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "Aucun compte n'est associé à cette adresse e-mail." });
        }

        // 1. Générer un jeton de réinitialisation unique et temporaire (expire dans 1 heure)
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
        await user.save();

        // 2. Créer le lien de réinitialisation vers ton frontend
        // Exemple : https://ton-site-arilona.vercel.app/reinitialiser-mot-de-passe/un_jeton_unique
        const resetUrl = `${process.env.FRONTEND_URL}/reinitialiser-mot-de-passe/${resetToken}`;

        // 3. Envoyer l'e-mail (Logique d'envoi avec Nodemailer, Resend ou Brevo)
        // Exemple rapide d'envoi :
        /* 
        await envoyerEmail({
            to: user.email,
            subject: "Maison Arilona - Réinitialisation de votre mot de passe",
            text: `Bonjour, veuillez utiliser ce lien pour réinitialiser votre mot de passe : ${resetUrl}`
        });
        */

        // Pour l'instant, on simule l'envoi réussi ou on l'affiche en console en dev
        console.log(`Lien de réinitialisation envoyé à ${email} : ${resetUrl}`);

        res.json({ success: true, message: "Lien envoyé avec succès." });

    } catch (error) {
        console.error("Erreur mot de passe oublié:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la génération du lien." });
    }
};



export { registerutilisateur, loginutilisateur, adminLogin, googleLogin, getProfilUtilisateur, updateProfilUtilisateur, motDePasseOublie };