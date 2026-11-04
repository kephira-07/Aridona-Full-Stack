import fs from 'fs';
import os from 'os';
import path from 'path';

const tmpRoot = path.resolve(os.tmpdir());

const safeTempPath = (filePath) => {
  if (!filePath || typeof filePath !== 'string') return null;
  // basename ignore tout préfixe de répertoire : empêche un path traversal.
  const resolved = path.resolve(tmpRoot, path.basename(filePath));
  if (resolved !== tmpRoot && resolved.startsWith(tmpRoot + path.sep)) return resolved;
  return null;
};

export const cleanLocalFile = (file) => {
  const resolved = safeTempPath(file?.path);
  if (!resolved || !fs.existsSync(resolved)) return;
  try {
    fs.unlinkSync(resolved);
  } catch (error) {
    console.error('Erreur nettoyage fichier temporaire:', error);
  }
};

export const cleanLocalFiles = (files) => {
  if (!files) return;
  Object.values(files).flatMap((f) => f).forEach(cleanLocalFile);
};
