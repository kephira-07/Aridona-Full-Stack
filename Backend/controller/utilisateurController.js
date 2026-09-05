import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { Resend } from 'resend';
import utilisateurModel from '../models/utilisateurModel.js';
import axios from 'axios';

// Helper pour générer des JWT compatibles avec le middleware auth.js
const createToken = (id, role = 'user', email = null) => {
  const payload = { id, role };
  if (email) payload.email = email;
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};



const googleLogin = async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ success: false, message: "Jeton d'accès Google manquant." });
    }

    // Vérifier que le token appartient bien à cette application Google.
    const tokenInfo = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
      params: { access_token },
    });
    if (process.env.GOOGLE_CLIENT_ID && tokenInfo.data.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ success: false, message: 'Token Google non autorisé.' });
    }
    if (tokenInfo.data.email_verified !== 'true') {
      return res.status(401).json({ success: false, message: 'Adresse Google non vérifiée.' });
    }

    const googleRes = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { email, name, picture, sub: googleId } = googleRes.data;

    // Chercher l'utilisateur dans MongoDB
    let user = await utilisateurModel.findOne({ email });

    if (!user) {
      // Création du compte Google dans MongoDB
      user = await utilisateurModel.create({
        name,
        email,
        googleId,
        avatar: picture,
        password: "" // Pas de mot de passe nécessaire
      });
    }

    // Génération de votre token JWT
    const token = createToken(user._id);

    return res.status(200).json({ success: true, token });
  } catch (error) {
    console.error("Erreur Backend googleLogin:", error.response?.data || error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 1. Inscription classique
const registerutilisateur = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Veuillez remplir tous les champs." });
    }

    const exists = await utilisateurModel.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: "Cet email est déjà utilisé." });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Format d'email invalide." });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Le mot de passe doit contenir au moins 8 caractères." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUtilisateur = new utilisateurModel({
      name,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    const utilisateur = await newUtilisateur.save();
    
    // Génération d'un token incluant le rôle 'user'
    const token = createToken(utilisateur._id, 'user', utilisateur.email);

    return res.status(201).json({ success: true, token });
  } catch (error) {
    console.error("Erreur Inscription:", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// 2. Connexion classique
const loginutilisateur = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Veuillez fournir l'email et le mot de passe." });
    }

    const utilisateur = await utilisateurModel.findOne({ email: email.toLowerCase() });
    if (!utilisateur) {
      return res.status(401).json({ success: false, message: "Identifiants incorrects." });
    }

    const isMatch = await bcrypt.compare(password, utilisateur.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Identifiants incorrects." });
    }

    const token = createToken(utilisateur._id, 'user', utilisateur.email);
    return res.json({ success: true, token });

  } catch (error) {
    console.error("Erreur Login Utilisateur:", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// 3. Connexion Administrateur
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.toLowerCase() : '';

    if (!email || !password || !adminEmail || !process.env.ADMIN_PASSWORD_HASH) {
      return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect." });
    }
    
    if (email.toLowerCase() !== adminEmail) {
      return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect." });
    }

    const isMatch = process.env.ADMIN_PASSWORD_HASH
      ? await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)
      : false;
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect." });
    }

    // Token unifié avec rôle 'admin' et email pour passer la sécurité de auth.js
    const token = jwt.sign(
      { id: 'admin_static_id', role: 'admin', email: adminEmail }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' } 
    );

    return res.json({ success: true, token });

  } catch (error) {
    console.error("Erreur Admin Login:", error);
    return res.status(500).json({ success: false, message: "Une erreur interne est survenue." });
  }
};

// 4. Profil Utilisateur
const getProfilUtilisateur = async (req, res) => {
  try {
    const userId = req.userId;
    const utilisateur = await utilisateurModel.findById(userId).select("-password");
    
    if (!utilisateur) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    }
    return res.json({ success: true, utilisateur });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Mise à jour du Profil
const updateProfilUtilisateur = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, telephone, adresse, ville } = req.body;

    const utilisateurMisAJour = await utilisateurModel.findByIdAndUpdate(
      userId,
      { name, telephone, adresse, ville },
      { new: true }
    ).select("-password");

    return res.json({ 
      success: true, 
      message: "Profil mis à jour avec succès !", 
      utilisateur: utilisateurMisAJour 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Liste des Utilisateurs (Réservé Admin)
const listerUtilisateurs = async (req, res) => {
  try {
    const utilisateurs = await utilisateurModel.find({}).select("-password"); 
    return res.json({ success: true, utilisateurs });
  } catch (error) {
    console.error("Erreur liste utilisateurs:", error);
    return res.status(500).json({ success: false, message: "Impossible de récupérer les utilisateurs." });
  }
};




// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// 8. Mot de passe oublié (Sécurisé)
const motDePasseOublie = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "L'adresse email est requise." });

    const user = await utilisateurModel.findOne({ email: email.toLowerCase() });

    // Réponse neutre pour éviter l'énumération des comptes
    if (!user) {
      return res.json({ 
        success: true, 
        message: "Si un compte est associé à cette adresse, un e-mail de réinitialisation vient d'être envoyé." 
      });
    }

    // Génération du token brut et de sa version hashée pour stockage en BDD
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Valable 1h
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL;
    const resetLink = `${frontendUrl}/reset-password/${rawToken}`;

    const { error } = await resend.emails.send({
      from: 'Maison Aridona <contact@aridona.store>',
      to: [user.email],
      subject: 'Réinitialisation de votre mot de passe — Aridona Héritage',
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; border: 1px solid #e3dfd9; background-color: #faf9f6; color: #1c1a17;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 28px; letter-spacing: 4px; text-transform: uppercase; margin: 0; font-weight: 300;">Aridona</h1>
            <p style="font-size: 9px; letter-spacing: 3px; text-transform: uppercase; margin: 5px 0 0; color: #b45309;">BIJOUX & HÉRITAGE</p>
          </div>
          <p style="font-size: 15px; line-height: 1.6; color: #2e2b27;">Bonjour ${user.name},</p>
          <p style="font-size: 14px; line-height: 1.6; color: #44403c;">
            Une demande de réinitialisation de mot de passe a été initiée pour votre espace client. Utilisez le lien ci-dessous :
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetLink}" style="background-color: #1c1a17; color: #ffffff; padding: 15px 30px; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; border-radius: 4px;">Réinitialiser mon mot de passe</a>
          </div>
          <p style="font-size: 11px; color: #78716c; line-height: 1.6; text-align: center;">Ce lien expirera dans une heure.</p>
        </div>
      `
    });

    if (error) {
      console.error("Erreur Resend:", error);
      return res.status(500).json({ success: false, message: "Échec de l'envoi de l'e-mail." });
    }

    return res.json({ 
      success: true, 
      message: "Si un compte est associé à cette adresse, un e-mail de réinitialisation vient d'être envoyé." 
    });

  } catch (error) {
    console.error("Erreur Reset Password Request:", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// 9. Réinitialisation effective du mot de passe
const reinitialiserMotDePasse = async (req, res) => {
  try {
    const { token, nouveauPassword } = req.body;

    if (!token || !nouveauPassword) {
      return res.status(400).json({ success: false, message: "Informations manquantes." });
    }

    // Calcul du hash du token reçu pour la comparaison
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await utilisateurModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Le lien est invalide ou a expiré." });
    }

    if (nouveauPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Le mot de passe doit contenir au moins 8 caractères." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(nouveauPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ success: true, message: "Mot de passe modifié avec succès !" });

  } catch (error) {
    console.error("Erreur enregistrement nouveau password:", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};




// Récupérer le panier de l'utilisateur connecté
const getUtilisateurPanier = async (req, res) => {
  try {
    const userId = req.userId; 
    const userData = await utilisateurModel.findById(userId);

    if (!userData) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    }

    const cartData = userData.cartData || {};
    const cartPacks = userData.cartPacks || {};
    return res.json({ success: true, cartData, cartPacks });
  } catch (error) {
    console.error("Erreur récupération panier :", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Ajouter / Synchroniser un article dans le panier BDD
const ajouterAuPanier = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId, size } = req.body;

    const userData = await utilisateurModel.findById(userId);
    let cartData = userData.cartData || {};

    if (!cartData[itemId]) {
      cartData[itemId] = {};
    }

    if (cartData[itemId][size]) {
      cartData[itemId][size] += 1;
    } else {
      cartData[itemId][size] = 1;
    }

    await utilisateurModel.findByIdAndUpdate(userId, { cartData });
    return res.json({ success: true, message: "Ajouté au panier BDD" });
  } catch (error) {
    console.error("Erreur ajout panier BDD :", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Mettre à jour la quantité d'un article dans le panier BDD
const updatePanier = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId, size, quantity, oldSize } = req.body;

    const userData = await utilisateurModel.findById(userId);
    let cartData = userData.cartData || {};

    // Changement de taille (modifierTaillePanier côté client) : on retire l'ancienne clé,
    // sinon elle reste orpheline en BDD et réapparaît au prochain chargement du panier.
    if (oldSize && oldSize !== size && cartData[itemId]) {
      delete cartData[itemId][oldSize];
    }

    if (quantity <= 0) {
      if (cartData[itemId]) {
        delete cartData[itemId][size];
        if (Object.keys(cartData[itemId]).length === 0) {
          delete cartData[itemId];
        }
      }
    } else {
      if (!cartData[itemId]) {
        cartData[itemId] = {};
      }
      cartData[itemId][size] = quantity;
    }

    await utilisateurModel.findByIdAndUpdate(userId, { cartData });
    return res.json({ success: true, message: "Panier mis à jour" });
  } catch (error) {
    console.error("Erreur mise à jour panier BDD :", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
// Supprimer un article du panier BDD
const deletePanier = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId, size } = req.body; // ou req.params si tu préfères passer en URL

    const userData = await utilisateurModel.findById(userId);
    let cartData = userData.cartData || {};

    if (cartData[itemId] && cartData[itemId][size]) {
      delete cartData[itemId][size];

      // Si plus aucune taille pour ce produit, on supprime complètement la clé
      if (Object.keys(cartData[itemId]).length === 0) {
        delete cartData[itemId];
      }

      await utilisateurModel.findByIdAndUpdate(userId, { cartData });
      return res.json({ success: true, message: "Article supprimé du panier" });
    }

    return res.status(404).json({ success: false, message: "Article introuvable dans le panier" });
  } catch (error) {
    console.error("Erreur suppression panier BDD :", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Ajouter un pack au panier BDD (toujours +1)
const ajouterPackAuPanier = async (req, res) => {
  try {
    const userId = req.userId;
    const { packId } = req.body;

    if (!mongoose.isValidObjectId(packId)) {
      return res.status(400).json({ success: false, message: "Identifiant de pack invalide." });
    }

    const userData = await utilisateurModel.findById(userId);
    const cartPacks = userData.cartPacks || {};
    cartPacks[packId] = (cartPacks[packId] || 0) + 1;

    await utilisateurModel.findByIdAndUpdate(userId, { cartPacks });
    return res.json({ success: true, message: "Pack ajouté au panier BDD" });
  } catch (error) {
    console.error("Erreur ajout pack panier BDD :", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Mettre à jour la quantité d'un pack dans le panier BDD (quantity <= 0 = suppression)
const updatePanierPack = async (req, res) => {
  try {
    const userId = req.userId;
    const { packId, quantity } = req.body;

    if (!mongoose.isValidObjectId(packId)) {
      return res.status(400).json({ success: false, message: "Identifiant de pack invalide." });
    }

    const userData = await utilisateurModel.findById(userId);
    const cartPacks = userData.cartPacks || {};

    if (quantity <= 0) {
      delete cartPacks[packId];
    } else {
      cartPacks[packId] = quantity;
    }

    await utilisateurModel.findByIdAndUpdate(userId, { cartPacks });
    return res.json({ success: true, message: "Panier de packs mis à jour" });
  } catch (error) {
    console.error("Erreur mise à jour pack panier BDD :", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Supprimer un pack du panier BDD
const deletePanierPack = async (req, res) => {
  try {
    const userId = req.userId;
    const { packId } = req.body;

    if (!mongoose.isValidObjectId(packId)) {
      return res.status(400).json({ success: false, message: "Identifiant de pack invalide." });
    }

    const userData = await utilisateurModel.findById(userId);
    const cartPacks = userData.cartPacks || {};

    if (!cartPacks[packId]) {
      return res.status(404).json({ success: false, message: "Pack introuvable dans le panier" });
    }

    delete cartPacks[packId];
    await utilisateurModel.findByIdAndUpdate(userId, { cartPacks });
    return res.json({ success: true, message: "Pack supprimé du panier" });
  } catch (error) {
    console.error("Erreur suppression pack panier BDD :", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


export { 
  registerutilisateur, 
  loginutilisateur, 
  adminLogin, 
  googleLogin, 
  getProfilUtilisateur, 
  updateProfilUtilisateur, 
  motDePasseOublie, 
  reinitialiserMotDePasse,
  listerUtilisateurs,
  getUtilisateurPanier,
  ajouterAuPanier,
  updatePanier,
  deletePanier,
  ajouterPackAuPanier,
  updatePanierPack,
  deletePanierPack
};