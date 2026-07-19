// Formatage coherent des durees (en minutes) dans toute l'application :
// bascule automatiquement en jours/heures/minutes au-dela de 24h, pour
// eviter des affichages du type "28h35min" au lieu de "1j 04h 35min".
export function formaterDuree(minutes) {
  const total = Math.round(Math.abs(minutes || 0));

  if (total < 60) return `${total} min`;

  const jours   = Math.floor(total / 1440);
  const heures  = Math.floor((total % 1440) / 60);
  const restant = total % 60;

  if (jours > 0) {
    const h = String(heures).padStart(2, '0');
    const m = String(restant).padStart(2, '0');
    return `${jours}j ${h}h ${m}min`;
  }

  return restant > 0 ? `${heures}h ${restant}min` : `${heures}h`;
}
