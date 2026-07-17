import utilisateurModel from '../models/utilisateurModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import{ Resend }from 'resend';


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

const resend = new Resend(process.env.RESEND_API_KEY);

// ================= 1. DEMANDE DE RÉINITIALISATION =================
 const motDePasseOublie = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await utilisateurModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "Aucun compte n'est associé à cette adresse e-mail." });
        }

        // Génération d'un token sécurisé de 32 octets convertis en hexadécimal
        const token = crypto.randomBytes(32).toString('hex');

        // Enregistrement du token et de sa validité (expire dans 1 heure)
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 heure en millisecondes
        await user.save();

        // Lien qui renvoie vers ton site en production ou local
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetLink = `${frontendUrl}/reinitialiser-mot-de-passe/${token}`;

        // Envoi de l'e-mail premium via Resend
        const { data, error } = await resend.emails.send({
            from: 'Maison Arilona <onboarding@resend.dev>', // Tu changeras par contact@arilonabijoux.com une fois ton domaine configuré
            to: [email],
            subject: 'Réinitialisation de votre mot de passe — Arilona Héritage',
            html: `
                <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; border: 1px solid #e3dfd9; background-color: #faf9f6; color: #1c1a17;">
                    <div style="text-align: center; margin-bottom: 40px;">
                        <h1 style="font-size: 28px; letter-spacing: 4px; text-transform: uppercase; margin: 0; font-weight: 300;">ARILONA</h1>
                        <p style="font-size: 9px; letter-spacing: 3px; text-transform: uppercase; margin: 5px 0 0; color: #b45309;">BIJOUX & HÉRITAGE</p>
                    </div>
                    
                    <p style="font-size: 15px; line-height: 1.6; color: #2e2b27;">Bonjour ${user.name},</p>
                    
                    <p style="font-size: 14px; line-height: 1.6; color: #44403c;">
                        Une demande de réinitialisation de mot de passe a été initiée pour votre espace client privé. Si vous êtes à l'origine de cette demande, veuillez utiliser le lien sécurisé ci-dessous pour créer un nouveau mot de passe :
                    </p>
                    
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${resetLink}" style="background-color: #1c1a17; color: #ffffff; padding: 15px 30px; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; border-radius: 4px;">Réinitialiser mon mot de passe</a>
                    </div>
                    
                    <p style="font-size: 11px; color: #78716c; line-height: 1.6; text-align: center;">
                        Ce lien est temporaire et expirera dans une heure.<br>
                        Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité. Votre mot de passe restera inchangé.
                    </p>
                    
                    <hr style="border: 0; border-top: 1px solid #e3dfd9; margin: 40px 0;">
                    
                    <div style="text-align: center; font-size: 10px; color: #a8a29e; letter-spacing: 1px;">
                        &copy; 2026 Maison Arilona. Tous droits réservés.
                    </div>
                </div>
            `
        });

        if (error) {
            console.error("Erreur d'envoi Resend:", error);
            return res.json({ success: false, message: "Impossible d'envoyer l'e-mail pour le moment." });
        }

        res.json({ success: true, message: "Un e-mail de réinitialisation vous a été envoyé." });

    } catch (error) {
        console.error("Erreur serveur lors de la demande de reset:", error);
        res.status(500).json({ success: false, message: "Erreur interne du serveur." });
    }
};

// ================= 2. ENREGISTREMENT DU NOUVEAU MOT DE PASSE =================
 const reinitialiserMotDePasse = async (req, res) => {
    try {
        const { token, nouveauPassword } = req.body;

        // On cherche l'utilisateur possédant le token ET dont l'heure de validité n'est pas passée ($gt = greater than Now)
        const user = await utilisateurModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.json({ success: false, message: "Le lien de réinitialisation est invalide ou a expiré." });
        }

        // Hachage du nouveau mot de passe
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(nouveauPassword, salt);

        // On nettoie les champs de réinitialisation pour que le token ne serve plus
        user.resetPasswordToken = "";
        user.resetPasswordExpires = null;
        await user.save();

        res.json({ success: true, message: "Votre mot de passe a été modifié avec succès. Vous pouvez vous connecter !" });

    } catch (error) {
        console.error("Erreur lors de l'enregistrement du nouveau mot de passe:", error);
        res.status(500).json({ success: false, message: "Erreur interne du serveur." });
    }
};

export { registerutilisateur, loginutilisateur, adminLogin, googleLogin, getProfilUtilisateur, updateProfilUtilisateur, motDePasseOublie, reinitialiserMotDePasse };