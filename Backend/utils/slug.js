import slugify from 'slugify';

// Génère un slug unique pour un modèle donné en ajoutant -2, -3... si le slug de base
// est déjà pris (par un autre document, ou par ce document-là si excludeId n'est pas fourni).
const generateUniqueSlug = async (model, nom, excludeId = null) => {
  const baseSlug = slugify(nom, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
  let slug = baseSlug;
  let counter = 2;
  while (await model.exists(excludeId ? { slug, _id: { $ne: excludeId } } : { slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

export default generateUniqueSlug;
