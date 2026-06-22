<template>

  <div class="kanban">
   <div class="toolbar">
  <button
    class="btn-filtres"
    @click="afficherFiltres = !afficherFiltres"
  >
    {{ afficherFiltres ? 'Masquer les filtres' : 'Afficher les filtres' }}
  </button>
</div>

<BarreFiltres
  v-if="afficherFiltres"
  @filtrer="appliquerFiltres"
/>

  <div class="kanban-page">
    <BarreFiltres @filtrer="appliquerFiltres" />


    <div v-if="store.chargement" class="chargement">
      <span class="chargement-dot"></span>
      <span class="chargement-dot"></span>
      <span class="chargement-dot"></span>
    </div>

    <div v-else class="colonnes">
      <div
        v-for="(tickets, statut) in store.tickets"
        :key="statut"
        class="colonne"
      >
        <div class="colonne-header">
          <div class="colonne-titre">
            <span class="colonne-accent" :style="{ background: couleurAccent[statut] }"></span>
            <span class="colonne-label">{{ labelsStatut[statut] }}</span>
          </div>
          <span class="compteur">{{ tickets.length }}</span>
        </div>

        <draggable
          :list="tickets"
          group="tickets"
          item-key="id"
          class="zone-depot"
          @change="onChange($event, statut)"
        >
          <template #item="{ element }">
            <div
              class="carte"
              @click="voirDetail(element.id)"
            >
              <div class="carte-id">{{ element.reference || `INC-${String(element.id).padStart(6,'0')}` }}</div>
              <div class="carte-titre">{{ element.titre }}</div>

              <div class="carte-meta">
                <span class="prio-badge" :class="`prio-${element.priorite}`">
                  <svg v-if="element.priorite === 'critique'" width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M6 2v4M6 8.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M1 10.5h10L6 1.5 1 10.5z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
                  </svg>
                  {{ labelsPriorite[element.priorite] || element.priorite }}
                </span>
                <span v-if="element.echeance" class="carte-date">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
                    <path d="M4 1v2M8 1v2M1 5h10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                  </svg>
                  {{ formaterDate(element.echeance) }}
                </span>
              </div>

              <div class="carte-sep"></div>

              <div class="carte-pied">
                <div v-if="element.assigne" class="carte-assigne">
                  <div class="avatar-xs">{{ initiales(element.assigne) }}</div>
                  <span class="assigne-nom">{{ element.assigne.prenom || element.assigne.nom }}</span>
                </div>
                <span v-else class="non-assigne">Non assigné</span>
                <span v-if="element.client" class="carte-client">{{ element.client.nom }}</span>
              </div>
            </div>
          </template>

          <template #footer>
            <div v-if="tickets.length === 0" class="vide">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.2"/>
                <path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
              <span>Aucun ticket</span>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <transition name="toast">
      <div v-if="erreurTransition" class="toast-erreur">
        {{ erreurTransition }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import draggable from 'vuedraggable';

import { useTicketsStore } from '../stores/tickets';
import CarteTicket from '../components/Kanban/CarteTicket.vue';
import BarreFiltres from '../components/Kanban/BarreFiltres.vue';

const store = useTicketsStore();
const router = useRouter();
const erreurTransition = ref('');

const afficherFiltres = ref(false);
=======
let erreurTimer = null;


const labelsStatut = {
  a_faire: 'À faire',
  en_cours: 'En cours',
  bloque: 'Bloqué',
  resolu: 'Résolu'
};

const couleurAccent = {
  a_faire: '#94a3b8',
  en_cours: '#3b7dd8',
  bloque: '#f97316',
  resolu: '#10b981'
};

const labelsPriorite = {
  critique: 'Critique',
  haute: 'Haute',
  moyenne: 'Moyenne',
  normale: 'Normale',
  basse: 'Basse'
};

function initiales(user) {
  if (!user) return '?';
  const p = user.prenom?.[0] || '';
  const n = user.nom?.[0] || '';
  return (p + n).toUpperCase() || '?';
}

function formaterDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function appliquerFiltres(filtres) {
  store.chargerTickets(filtres);
}

async function onChange(event, nouveauStatut) {
  if (!event.added) return;
  const ticket = event.added.element;
  erreurTransition.value = '';
  try {
    await store.changerStatut(ticket.id, nouveauStatut);
  } catch (error) {
    erreurTransition.value =
      error.response?.data?.message || 'Transition non autorisée';
    clearTimeout(erreurTimer);
    erreurTimer = setTimeout(() => { erreurTransition.value = ''; }, 4000);
    await store.chargerTickets();
  }
}

function voirDetail(id) {
  router.push(`/tickets/${id}`);
}

onMounted(async () => {
  await store.chargerTickets();
});
</script>

<style scoped>
.kanban-page {
  padding: 20px;
  min-height: 100vh;
  background: var(--bg);
}

/* Colonnes */
.colonnes {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  min-height: 78vh;
  padding-bottom: 8px;
}

.colonne {
  flex: 1;
  min-width: 240px;
  max-width: 300px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.colonne-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
}

.colonne-titre {
  display: flex;
  align-items: center;
  gap: 8px;
}

.colonne-accent {
  width: 3px;
  height: 16px;
  border-radius: 2px;
  flex-shrink: 0;
}

.colonne-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
}

.compteur {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--bg);
  color: var(--ink-soft);
  border: 1px solid var(--border);
}

/* Zone draggable */
.zone-depot {
  flex: 1;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 80px;
}

/* Carte ticket */
.carte {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 10px 0;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.carte:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-sm);
}

.carte-id {
  font-size: 10px;
  color: var(--ink-soft);
  font-family: monospace;
  letter-spacing: 0.3px;
  margin-bottom: 4px;
}

.carte-titre {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.4;
  margin-bottom: 8px;
}

.carte-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

/* Priorité badges */
.prio-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 3px 7px;
  border-radius: 999px;
}

.prio-critique { background: var(--danger-soft); color: var(--danger); }
.prio-haute    { background: var(--warning-soft); color: #a16207; }
.prio-moyenne  { background: var(--warning-soft); color: #a16207; }
.prio-normale  { background: #e0f2fe; color: #0369a1; }
.prio-basse    { background: var(--success-soft); color: var(--success); }

.carte-date {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: var(--ink-soft);
}

/* Séparateur pointillé */
.carte-sep {
  border-top: 2px dashed var(--border);
  margin: 0 -10px;
}

/* Pied de carte */
.carte-pied {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0 8px;
}

.carte-assigne {
  display: flex;
  align-items: center;
  gap: 5px;
}

.avatar-xs {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--navy);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: 600;
  flex-shrink: 0;
}

.assigne-nom {
  font-size: 10px;
  color: var(--ink-soft);
}

.non-assigne {
  font-size: 10px;
  color: var(--ink-soft);
  font-style: italic;
}

.carte-client {
  font-size: 10px;
  color: var(--ink-soft);
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Colonne vide */
.vide {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px 0;
  color: var(--border-strong);
  font-size: 12px;
}

/* Chargement */
.chargement {
  display: flex;
  gap: 6px;
  justify-content: center;
  padding: 60px 0;
}

.toolbar {
  margin-bottom: 16px;
}

.btn-filtres {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.btn-filtres:hover {
  opacity: 0.9;
}


.chargement-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse 1.2s ease-in-out infinite;
}

.chargement-dot:nth-child(2) { animation-delay: 0.2s; }
.chargement-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes pulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}

/* Toast erreur */
.toast-erreur {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--danger);
  color: white;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  max-width: 320px;
  box-shadow: var(--shadow-md);
  z-index: 999;
}

.toast-enter-active,
.toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from,
.toast-leave-to { opacity: 0; transform: translateY(8px); }
>>>>>>> 9dbae29fcbc8c629704af7434f636ce93d033a89
</style>