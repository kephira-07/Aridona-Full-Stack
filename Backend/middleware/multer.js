import multer from 'multer';
import path from 'path';
import os from 'os';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

// Stockage disque temporaire : les fichiers sont écrits dans /tmp (répertoire
// temporaire natif du système). Le contrôleur les envoie ensuite à Cloudinary
// via `cloudinary.uploader.upload(file.path, ...)` puis les supprime avec
// cleanLocalFiles. os.tmpdir() est portable — il fonctionne aussi sur les
// hébergeurs où seul /tmp est accessible en écriture.
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, os.tmpdir());
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return callback(new Error('Format non supporté. Veuillez importer une image (PNG, JPG, WEBP).'));
    }
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `aridona-${uniqueSuffix}${extension}`);
  },
});

// Sécurité : on n'accepte que les images raster (pas de SVG). Le rejet lève une
// erreur qui remonte dans le middleware Express — d'où la nécessité du
// gestionnaire d'erreurs multer dans server.js (voir la note ci-dessous).
const fileFilter = (req, file, callback) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('Format non supporté. Veuillez importer une image (PNG, JPG, WEBP).'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Mo par image
  },
});

export default upload;

/*
  RAPPEL — gestionnaire d'erreurs à placer dans server.js, APRÈS tes routes.
  En multer 2.x, les erreurs de fileFilter et de limite de taille se déclenchent
  dans le middleware (avant tes contrôleurs), donc tes try/catch ne les attrapent
  pas. Sans ce handler, une image rejetée renvoie une page HTML générique au lieu
  de ton JSON { success: false }.

  app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Upload: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
*/
