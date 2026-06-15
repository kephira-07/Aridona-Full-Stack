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
        
        // 🛠️ SOLUTION : On stocke l'ID dans req.userId à la place de req.body
        req.userId = token_decode.id; 
        
        next(); 
    } catch (error) {
        console.error("Erreur Auth Middleware:", error.message);
        return res.status(401).json({ success: false, message: "Session expirée ou token invalide." });
    }
};

export default authUser;