<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Tableau de bord</h1>
      
    </div>


    <div v-if="chargement" class="chargement">
      <span class="dot"></span><span class="dot"></span><span class="dot"></span>
    </div>
 
    <div v-else>
      <div class="kpi-grille">
        <div class="kpi-carte bleu cliquable" @click="ouvrirListe('ouverts')">
          <span class="kpi-valeur">{{ kpi.tickets_ouverts }}</span>
          <span class="kpi-label">Tickets ouverts</span>
        </div>
        <div class="kpi-carte vert cliquable" @click="ouvrirListe('resolus')">
          <span class="kpi-valeur">{{ kpi.tickets_resolus }}</span>
          <span class="kpi-label">Tickets résolus</span>
        </div>
        <div class="kpi-carte orange">
          <span class="kpi-valeur">{{ formaterDuree(kpi.temps_moyen_resolution_min) }}</span>
          <span class="kpi-label">Temps moyen résolution</span>
        </div>
        <div class="kpi-carte rouge cliquable" @click="ouvrirListe('critiques_non_assignes')">
          <span class="kpi-valeur">{{ kpi.critiques_non_assignes }}</span>
          <span class="kpi-label">Critiques non assignés</span>
        </div>
        <div class="kpi-carte violet cliquable" @click="ouvrirListe('bloques')">
          <span class="kpi-valeur">{{ kpi.tickets_bloques }}</span>
          <span class="kpi-label">Tickets bloqués</span>
        </div>
        <div class="kpi-carte gris">
          <span class="kpi-valeur">{{ kpi.taux_resolution_pct }}%</span>
          <span class="kpi-label">Taux de résolution</span>
        </div>
        <div class="kpi-carte noir cliquable" @click="ouvrirListe('supprimes')">
          <span class="kpi-valeur">{{ kpi.tickets_supprimes }}</span>
          <span class="kpi-label">Tickets supprimés</span>
        </div>
      </div>

      <div class="graphiques">
        <div class="graphique-bloc">
          <h3>Répartition par priorité</h3>
          <div class="barres">
            <div v-for="item in kpi.par_priorite" :key="item.priorite" class="barre-item">
              <div class="barre-label">{{ item.priorite }}</div>
              <div class="barre-piste">
                <div class="barre-fill" :class="item.priorite" :style="{ width: largeurBarre(item.total) + '%' }"></div>
              </div>
              <div class="barre-val">{{ item.total }}</div>
            </div>
          </div>
        </div>

        <div class="graphique-bloc">
          <h3>Répartition par statut</h3>
          <div class="barres">
            <div v-for="item in kpi.par_statut" :key="item.statut" class="barre-item">
              <div class="barre-label">{{ labelsStatut[item.statut] || item.statut }}</div>
              <div class="barre-piste">
                <div class="barre-fill" :class="item.statut" :style="{ width: largeurBarre(item.total) + '%' }"></div>
              </div>
              <div class="barre-val">{{ item.total }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modale drill-down : liste des tickets d'une categorie -->
    <transition name="modal">
      <div v-if="listeOuverte" class="modal-overlay" @click.self="fermerListe">
        <div class="modal-liste card-surface">
          <div class="modal-liste-header">
            <h3>{{ listeTitre }}</h3>
            <button class="btn-fermer" @click="fermerListe">×</button>
          </div>

          <div v-if="listeChargement" class="liste-chargement">Chargement...</div>
          <div v-else-if="listeTickets.length === 0" class="liste-vide">Aucun ticket</div>
          <div v-else class="liste-tickets">
            <button
              v-for="t in listeTickets"
              :key="t.id"
              class="ligne-ticket"
              @click="voirTicket(t.id)"
            >
              <span class="ligne-ref">{{ t.reference }}</span>
              <span class="ligne-titre">{{ t.titre }}</span>
              <span :class="['tag', t.statut]">{{ labelsStatut[t.statut] || t.statut }}</span>
              <span :class="['tag', t.priorite]">{{ t.priorite }}</span>
              <span class="ligne-assigne">{{ t.assigne?.nom || 'Non assigné' }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { formaterDuree } from '../utils/duree';

const router      = useRouter();
const kpi         = ref(null);
const chargement  = ref(true);

const labelsStatut = {
  a_faire: 'À faire', en_cours: 'En cours', bloque: 'Bloqué', resolu: 'Résolu'
};

// ── Drill-down des tuiles KPI ────────────────────────────────────────────
const listeOuverte     = ref(false);
const listeTitre       = ref('');
const listeChargement  = ref(false);
const listeTickets     = ref([]);

const TITRES_CATEGORIE = {
  ouverts:                'Tickets ouverts',
  resolus:                'Tickets résolus',
  bloques:                'Tickets bloqués',
  critiques_non_assignes: 'Critiques non assignés',
  supprimes:              'Tickets supprimés',
};

function serialiserParams(params) {
  const parts = [];
  Object.entries(params).forEach(([key, val]) => {
    if (Array.isArray(val)) {
      val.forEach(v => { if (v) parts.push(`${key}[]=${encodeURIComponent(v)}`); });
    } else if (val !== '' && val !== null && val !== undefined) {
      parts.push(`${key}=${encodeURIComponent(val)}`);
    }
  });
  return parts.join('&');
}

function paramsCategorie(categorie) {
  switch (categorie) {
    case 'resolus':   return { statut: ['resolu'] };
    case 'bloques':    return { statut: ['bloque'] };
    case 'critiques_non_assignes':
      return { statut: ['a_faire', 'en_cours', 'bloque'], priorite: ['critique'], non_assigne: 'true' };
    case 'supprimes': return { supprime: 'true' };
    case 'ouverts':
    default:          return { statut: ['a_faire', 'en_cours', 'bloque'] };
  }
}

async function ouvrirListe(categorie) {
  listeOuverte.value    = true;
  listeTitre.value      = TITRES_CATEGORIE[categorie] || '';
  listeChargement.value = true;
  listeTickets.value    = [];

  try {
    const res = await api.get('/tickets', {
      params: paramsCategorie(categorie),
      paramsSerializer: serialiserParams,
    });
    listeTickets.value = Object.values(res.data.data).flat();
  } catch (e) {
    console.error('Erreur chargement liste tickets :', e);
  } finally {
    listeChargement.value = false;
  }
}

function fermerListe() {
  listeOuverte.value = false;
}

function voirTicket(id) {
  fermerListe();
  router.push(`/tickets/${id}`);
}

function largeurBarre(valeur) {
  if (!kpi.value) return 0;
  const max = Math.max(
    ...(kpi.value.par_priorite || []).map(i => Number(i.total)),
    ...(kpi.value.par_statut   || []).map(i => Number(i.total)),
    1
  );
  return Math.round((Number(valeur) / max) * 100);
}

onMounted(async () => {
  try {
    const res = await api.get('/stats/kpi');
    kpi.value = res.data.data;
  } catch (e) {
    console.error('Erreur KPI :', e);
  } finally {
    chargement.value = false;
  }
});
</script>

<style scoped>
.dashboard {
  padding: 24px 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 20px;
}

.dashboard h1 {
  font-size: 20px;
  font-weight: 700;
  color: var(--ink);
}

/* Loader */
.chargement { display: flex; gap: 6px; justify-content: center; padding: 60px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); animation: pulse 1.2s ease-in-out infinite; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes pulse { 0%,80%,100% { opacity:0.3; transform:scale(0.8); } 40% { opacity:1; transform:scale(1); } }

/* KPI */
.kpi-grille {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.kpi-carte {
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}



.kpi-carte.bleu   { background: #dbeafe; }
.kpi-carte.vert   { background: #dcfce7; }
.kpi-carte.orange { background: #ffedd5; }
.kpi-carte.rouge  { background: #fee2e2; }
.kpi-carte.violet { background: #ede9fe; }
.kpi-carte.gris   { background: #f1f5f9; }
.kpi-carte.noir   { background: #e2e8f0; }

.kpi-carte.cliquable { cursor: pointer; transition: transform 0.12s, box-shadow 0.12s; }
.kpi-carte.cliquable:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(15,23,42,0.1); }

.kpi-valeur { font-size: 32px; font-weight: 800; color: var(--ink); line-height: 1; }
.kpi-label  { font-size: 12px; color: var(--ink-soft); font-weight: 500; }

/* Modale drill-down */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(15,23,42,0.45);
  z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-liste {
  background: white; width: 100%; max-width: 560px; max-height: 80vh;
  border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 12px;
  overflow: hidden;
}
.modal-liste-header { display: flex; align-items: center; justify-content: space-between; }
.modal-liste-header h3 { font-size: 15px; font-weight: 700; color: var(--ink); }
.btn-fermer {
  background: none; border: none; cursor: pointer; font-size: 20px;
  line-height: 1; color: var(--ink-soft); padding: 0 4px;
}
.liste-chargement, .liste-vide {
  text-align: center; padding: 30px 0; color: var(--ink-soft); font-size: 13px;
}
.liste-tickets { display: flex; flex-direction: column; gap: 6px; overflow-y: auto; }
.ligne-ticket {
  display: flex; align-items: center; gap: 10px; width: 100%;
  background: var(--bg); border: 1px solid var(--border); border-radius: 8px;
  padding: 10px 12px; cursor: pointer; text-align: left; transition: border-color 0.15s;
}
.ligne-ticket:hover { border-color: var(--accent); }
.ligne-ref { font-size: 11px; color: var(--ink-soft); font-family: monospace; flex-shrink: 0; }
.ligne-titre { font-size: 13px; color: var(--ink); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ligne-assigne { font-size: 11px; color: var(--ink-soft); flex-shrink: 0; }

.tag { font-size: 10px; padding: 2px 7px; border-radius: 999px; font-weight: 600; text-transform: uppercase; flex-shrink: 0; }
.tag.a_faire  { background: #e0f2fe; color: #0284c7; }
.tag.en_cours { background: #fef9c3; color: #a16207; }
.tag.bloque   { background: #fee2e2; color: #dc2626; }
.tag.resolu   { background: #dcfce7; color: #16a34a; }
.tag.critique { background: #fee2e2; color: #dc2626; }
.tag.moyenne  { background: #ffedd5; color: #a16207; }
.tag.basse    { background: #dcfce7; color: #16a34a; }

.modal-enter-active, .modal-leave-active { transition: all 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

/* Graphiques */
.graphiques {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.graphique-bloc {
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
}

.graphique-bloc h3 { font-size: 13px; font-weight: 600; margin-bottom: 14px; color: var(--ink); }

.barres { display: flex; flex-direction: column; gap: 10px; }

.barre-item { display: flex; align-items: center; gap: 8px; }

.barre-label {
  font-size: 11px; color: var(--ink-soft);
  width: 70px; text-align: right; flex-shrink: 0; text-transform: capitalize;
}

.barre-piste {
  flex: 1; background: var(--bg);
  border-radius: 999px; height: 10px; overflow: hidden;
}

.barre-fill { height: 10px; border-radius: 999px; transition: width 0.5s ease; }

.barre-fill.critique { background: #dc2626; }
.barre-fill.moyenne  { background: #f97316; }
.barre-fill.basse    { background: #16a34a; }
.barre-fill.haute    { background: #f59e0b; }
.barre-fill.a_faire  { background: #94a3b8; }
.barre-fill.en_cours { background: #3b7dd8; }
.barre-fill.bloque   { background: #f97316; }
.barre-fill.resolu   { background: #10b981; }

.barre-val { font-size: 11px; font-weight: 600; color: var(--ink); width: 22px; flex-shrink: 0; }

/* Responsive */
@media (max-width: 700px) {
  .dashboard { padding: 16px 12px; }
  .kpi-grille { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .kpi-valeur { font-size: 24px; }
  .graphiques { grid-template-columns: 1fr; }
}

@media (max-width: 400px) {
  .kpi-grille { grid-template-columns: 1fr; }
}
</style>