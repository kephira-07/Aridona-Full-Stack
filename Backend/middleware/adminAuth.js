import jwt from 'jsonwebtoken';

/**
 * Middleware de sécurité pour le Panel Admin
 * Vérifie la validité du token JWT de l'administrateur
 */
const adminAuth = async (req, res, next) => {
    try {
        // 1. Extraction du token depuis les headers de la requête Axios
        // Gère les deux formats classiques : 'token' direct ou le format standard 'Authorization: Bearer <token>'
        const token = req.headers.token || req.headers.authorization?.split(' ')[1];

        // 2. Si aucun token n'est fourni, on bloque immédiatement l'accès
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "Accès refusé. Session administrateur manquante ou expirée." 
            });
        }

        // 3. Décodage et vérification de la signature du jeton
        // Utilise la clé secrète JWT_SECRET définie dans ton fichier .env
        const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Vérification stricte du contenu du token
        // L'email à l'intérieur du token DOIT correspondre exactement à l'ADMIN_EMAIL du fichier .env
       // 4. Vérification stricte du contenu du token (À mettre à l'étape 4 de ton adminAuth.js)
            const adminEmailAttendu = process.env.ADMIN_EMAIL;

            if (tokenDecoded.email !== adminEmailAttendu || tokenDecoded.role !== 'admin') {
                return res.status(403).json({ 
                    success: false, 
                    message: "Accès interdit. Vous n'avez pas les privilèges requis pour cette action." 
                });
            }

        // 5. Tout est parfait, on passe au contrôleur suivant (ex: allOrders ou updateStatus)
        next();

    } catch (error) {
        console.error("Erreur d'authentification Admin:", error.message);
        
        // Gestion propre des erreurs spécifiques à JWT (Jeton expiré ou modifié manuellement)
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Votre session a expiré, veuillez vous reconnecter." });
        }
        
        return res.status(401).json({ success: false, message: "Jeton d'authentification invalide ou corrompu." });
    }
};

export default adminAuth;