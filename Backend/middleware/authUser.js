import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    try {
        let token = req.headers.token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: "Non autorisé, veuillez vous connecter." });
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        
        // 🛠️ LA DOUBLE SÉCURITÉ :
        // 1. On le met dans req.userId pour les nouveaux contrôleurs épurés
        req.userId = token_decode.id; 
        
        // 2. On l'injecte AUSSI dans req.body.userId pour ne pas casser tes anciens contrôleurs (panier, etc.)
        if (!req.body) {
            req.body = {};
        }
        req.body.userId = token_decode.id; 
        
        next(); 
    } catch (error) {
        console.error("Erreur Auth Middleware:", error.message);
        return res.status(401).json({ success: false, message: "Session expirée ou token invalide." });
    }
};

export default authUser;