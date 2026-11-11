import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import utilisateurModel from '../models/utilisateurModel.js';
import axios from 'axios';

// Helper pour générer des JWT compatibles avec le middleware auth.js
const createToken = (id, role = 'user', email = null) => {
  const payload = { id, role };
  if (email) payload.email = email;
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. Connexion / Inscription 1-clic avec Google
const googleLogin = async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ success: false, message: "Jeton d'accès Google manquant." });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error("GOOGLE_CLIENT_ID manquant : connexion Google refusée.");
      return res.status(503).json({ success: false, message: "Connexion Google temporairement indisponible." });
    }

    const tokenInfo = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
      params: { access_token },
    });
    if (tokenInfo.data.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ success: false, message: 'Token Google non autorisé.' });
    }
    const emailVerified = tokenInfo.data.email_verified;
    if (emailVerified !== true && emailVerified !== 'true') {
      return res.status(401).json({ success: false, message: 'Adresse Google non vérifiée.' });
    }

    const googleRes = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { email, name, picture, sub: googleId } = googleRes.data;

    let user = await utilisateurModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await utilisateurModel.create({
        name: name || 'Membre Google',
        email: email.toLowerCase(),
        googleId,
        avatar: picture || '',
        password: ''
      });
    } else {
      if (!user.googleId) user.googleId = googleId;
      if (!user.avatar && picture) user.avatar = picture;
      await user.save();
    }

    const token = createToken(user._id, user.role || 'client', user.email);
    return res.status(200).json({ success: true, token, user: { name: user.name, email: user.email } });
  } catch (error) {
    console.error("Erreur Backend googleLogin:", error.response?.data || error.message);
    return res.status(500).json({ success: false, message: "Erreur lors de la connexion Google." });
  }
};

// 2. Inscription par formulaire (Nom + Email, mot de passe facultatif)
const registerutilisateur = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Le nom et l'adresse email sont obligatoires." });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!validator.isEmail(cleanEmail)) {
      return res.status(400).json({ success: false, message: "Format d'adresse email invalide." });
    }

    let user = await utilisateurModel.findOne({ email: cleanEmail });
    if (user) {
      // Si l'utilisateur existe déjà, on génère simplement sa session
      const token = createToken(user._id, user.role || 'client', user.email);
      return res.status(200).json({ 
        success: true, 
        message: "Heureux de vous revoir !", 
        token, 
        user: { name: user.name, email: user.email } 
      });
    }

    let hashedPassword = '';
    if (password && password.trim().length >= 4) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    user = await utilisateurModel.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: 'client'
    });

    const token = createToken(user._id, 'client', user.email);
    return res.status(201).json({ 
      success: true, 
      message: "Bienvenue chez Aridona !", 
      token, 
      user: { name: user.name, email: user.email } 
    });
  } catch (error) {
    console.error("Erreur Inscription:", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// 3. Connexion classique (Email + mot de passe ou email seul si sans mot de passe)
const loginutilisateur = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Veuillez fournir votre adresse email." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await utilisateurModel.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: "Aucun compte trouvé avec cette adresse email. Veuillez vous inscrire." });
    }

    // Si le compte a un mot de passe enregistré
    if (user.password && user.password.startsWith('$2')) {
      if (!password) {
        return res.status(400).json({ success: false, message: "Ce compte requiert votre mot de passe." });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Mot de passe incorrect." });
      }
    }

    const token = createToken(user._id, user.role || 'client', user.email);
    return res.json({ 
      success: true, 
      message: "Connexion réussie !", 
      token, 
      user: { name: user.name, email: user.email } 
    });

  } catch (error) {
    console.error("Erreur Login Utilisateur:", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// 4. Connexion Administrateur
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

    const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect." });
    }

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

// 5. Profil Utilisateur
const getProfilUtilisateur = async (req, res) => {
  try {
    const userId = req.userId;
    const utilisateur = await utilisateurModel.findById(userId).select("-password");
    
    if (!utilisateur) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    }
    return res.json({ success: true, utilisateur });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// 6. Mise à jour du Profil
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
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// 7. Liste des Utilisateurs (Réservé Admin)
const listerUtilisateurs = async (req, res) => {
  try {
    const utilisateurs = await utilisateurModel.find({}).select("-password").sort({ createdAt: -1 }); 
    return res.json({ success: true, utilisateurs });
  } catch (error) {
    console.error("Erreur liste utilisateurs:", error);
    return res.status(500).json({ success: false, message: "Impossible de récupérer les utilisateurs." });
  }
};

// 8. Panier utilisateur BDD
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
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

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
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

const updatePanier = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId, size, quantity, oldSize } = req.body;

    const userData = await utilisateurModel.findById(userId);
    let cartData = userData.cartData || {};

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
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

const deletePanier = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId, size } = req.body;

    const userData = await utilisateurModel.findById(userId);
    let cartData = userData.cartData || {};

    if (cartData[itemId] && cartData[itemId][size]) {
      delete cartData[itemId][size];
      if (Object.keys(cartData[itemId]).length === 0) {
        delete cartData[itemId];
      }
      await utilisateurModel.findByIdAndUpdate(userId, { cartData });
      return res.json({ success: true, message: "Article supprimé du panier" });
    }

    return res.status(404).json({ success: false, message: "Article introuvable dans le panier" });
  } catch (error) {
    console.error("Erreur suppression panier BDD :", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

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
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

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
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

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
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

export { 
  registerutilisateur, 
  loginutilisateur, 
  adminLogin, 
  googleLogin, 
  getProfilUtilisateur, 
  updateProfilUtilisateur, 
  listerUtilisateurs,
  getUtilisateurPanier,
  ajouterAuPanier,
  updatePanier,
  deletePanier,
  ajouterPackAuPanier,
  updatePanierPack,
  deletePanierPack
};
