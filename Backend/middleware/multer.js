import multer from 'multer';

// Configuration du stockage temporaire sur le serveur backend
const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        // Donne un nom unique au fichier pour éviter les conflits
        callback(null, Date.now() + "_" + file.originalname);
    }
});

const upload = multer({ storage: storage });

export default upload;