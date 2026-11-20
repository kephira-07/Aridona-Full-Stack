/**
 * Optimise une URL Cloudinary à la volée (format WebP/AVIF automatique, compression et redimensionnement).
 * Laisse les autres URLs (placeholders, assets locaux) intactes.
 */
export const getOptimizedImageUrl = (url, width = 600) => {
  if (!url || typeof url !== 'string' || !url.includes('/upload/')) return url;
  if (url.includes('f_auto') || url.includes('q_auto')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
};
