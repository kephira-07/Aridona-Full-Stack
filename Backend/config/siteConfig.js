// Constantes partagées entre les contrôleurs backend et exposées au client via /api/config,
// pour éviter qu'une valeur comme les frais de livraison ne soit dupliquée et désynchronisée
// entre orderController.js (recalcul serveur) et le frontend (affichage panier/commande).
export const FRAIS_LIVRAISON = 500;
