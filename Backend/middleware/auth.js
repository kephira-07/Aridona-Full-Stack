import jwt from 'jsonwebtoken';

/**
 * Middleware d'authentification et de contrôle d'accès basé sur les rôles (RBAC)
 * @param {Array<string>} roles - Liste des rôles autorisés (ex: ['admin'], ['admin', 'manager']). Si vide = accessible à tout utilisateur connecté.
 */
const auth = (roles = []) => {
  return async (req, res, next) => {
    try {
      // 1. Extraction du token (headers "token" ou standard "Authorization: Bearer <token>")
      let token = req.headers.token;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        return res.status(401).json({ 
          success: false, 
          message: "Non autorisé, veuillez vous connecter." 
        });
      }

      // 2. Décodage du jeton
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Support hybride id/_id pour éviter tout échec selon la méthode de signature du JWT
      const userId = decoded.id || decoded._id;

      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: "Token invalide : identifiant utilisateur introuvable." 
        });
      }

      // 3. Attachement des informations à la requête
      req.userId = userId;
      req.userRole = decoded.role;

      // 4. Rétrocompatibilité anciens contrôleurs (injection dans req.body)
      if (typeof req.body !== 'object' || req.body === null) {
        req.body = {};
      }
      req.body.userId = userId;

      // 5. Contrôle d'accès basé sur les rôles (RBAC)
      if (roles.length > 0) {
        // Vérification du rôle présent dans le token
        if (!roles.includes(decoded.role)) {
          return res.status(403).json({ 
            success: false, 
            message: "Accès interdit. Privilèges insuffisants." 
          });
        }

        // SÉCURITÉ RENFORCÉE POUR L'ADMINISTRATION :
        // Validation stricte de l'email admin face à la variable d'environnement ADMIN_EMAIL
        if (decoded.role === 'admin' || roles.includes('admin')) {
          const adminEmailAttendu = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.toLowerCase() : '';
          const emailToken = decoded.email ? decoded.email.toLowerCase() : '';

          if (!adminEmailAttendu || emailToken !== adminEmailAttendu) {
            return res.status(403).json({ 
              success: false, 
              message: "Accès interdit. Identité administrateur non reconnue." 
            });
          }
        }
      }

      next();
    } catch (error) {
      console.error("Erreur Auth Middleware :", error.message);

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: "Session expirée, veuillez vous reconnecter." 
        });
      }

      return res.status(401).json({ 
        success: false, 
        message: "Session invalide ou corrompue." 
      });
    }
  };
};

export default auth;