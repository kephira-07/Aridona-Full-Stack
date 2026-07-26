import multer from 'multer';
import path from 'path';
import os from 'os';

// Répertoire temporaire natif Linux/Ubuntu (/tmp)
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, os.tmpdir());
  },
  filename: function (req, file, callback) {
    const extension = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    callback(null, `aridona-${uniqueSuffix}${extension}`);
  }
});

// Filtrage de sécurité : images uniquement
const fileFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image/')) {
    callback(null, true);
  } else {
    callback(new Error('Format non supporté. Veuillez importer une image (PNG, JPG, WEBP).'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5 Mo par image
  }
});

export default upload;