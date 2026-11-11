// Constantes partagées entre les contrôleurs backend et exposées au client via /api/config.
export const FRAIS_LIVRAISON = 1000;
export const SEUIL_LIVRAISON_GRATUITE = 25000;

/**
 * Calcule les frais de livraison selon le montant du sous-total :
 * - 0 FCFA si le panier est vide
 * - Gratuit (0 FCFA) dès 25.000 FCFA d'achats
 * - 1.000 FCFA sinon
 */
export const calculerFraisLivraison = (sousTotal = 0) => {
  const montant = Number(sousTotal) || 0;
  if (montant <= 0) return 0;
  if (montant >= SEUIL_LIVRAISON_GRATUITE) return 0;
  return FRAIS_LIVRAISON;
};
