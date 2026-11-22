// Constantes partagées entre les contrôleurs backend et exposées au client via /api/config.
export const FRAIS_LIVRAISON = 0;
export const SEUIL_LIVRAISON_GRATUITE = 0;
export const SEUIL_REDUCTION = 25000;
export const TAUX_REDUCTION = 0.1;

/**
 * Calcule les frais de livraison selon le montant du sous-total.
 * Actuellement aucun frais de livraison n'est appliqué sur le site.
 */
export const calculerFraisLivraison = () => 0;

/**
 * Calcule la réduction appliquée selon le sous-total :
 * - 10 % de réduction dès 25.000 FCFA d'achats
 * - 0 FCFA sinon
 */
export const calculerReduction = (sousTotal = 0) => {
  const montant = Number(sousTotal) || 0;
  if (montant < SEUIL_REDUCTION) return 0;
  return Math.round(montant * TAUX_REDUCTION);
};
