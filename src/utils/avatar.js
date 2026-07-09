// Palette et logique partagées pour générer une couleur et des initiales
// cohérentes pour un même utilisateur, partout dans l'application
// (Kanban, filtres, commentaires, NavBar, profil).

const PALETTE = ['#3b7dd8', '#10b981', '#f97316', '#8b5cf6', '#ef4444', '#a855f7'];

function hashId(id) {
  if (!id) return 0;
  return String(id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

export function couleurUtilisateur(id) {
  if (!id) return '#1e293b';
  return PALETTE[hashId(id) % PALETTE.length];
}

export function initiales(nom) {
  if (!nom) return '?';
  return nom.slice(0, 2).toUpperCase();
}