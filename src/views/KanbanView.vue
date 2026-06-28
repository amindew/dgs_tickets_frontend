<template>
  <div class="kanban-page">

    <transition name="overlay-fade">
      <div
        v-if="drawerOuvert"
        class="overlay"
        @click="$emit('update:drawerOuvert', false)"
        aria-hidden="true"
      ></div>
    </transition>

    <transition name="drawer-slide">
      <div v-if="drawerOuvert" class="drawer" role="dialog" aria-label="Filtres">
        <div class="drawer-close">
          <button class="btn-fermer" @click="$emit('update:drawerOuvert', false)">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <BarreFiltres @filtrer="appliquerFiltres" />
      </div>
    </transition>

    <div class="kanban-contenu" :class="{ 'contenu-dimme': drawerOuvert }">
      <div v-if="store.chargement" class="chargement">
        <span class="chargement-dot"></span>
        <span class="chargement-dot"></span>
        <span class="chargement-dot"></span>
      </div>

      <div v-else class="colonnes">
        <div v-for="(tickets, statut) in store.tickets" :key="statut" class="colonne">
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
  ::class="[
  niveauSLA(element, statut),
  {
    'carte-critique-retard':
      statut === 'a_faire' &&
      estCritiqueEnRetard(element)
  }
]"
 @click="voirDetail(element.id)"
>
   

                <div class="carte-id">{{ element.reference || `INC-${String(element.id).padStart(6,'0')}` }}</div>
                <div class="carte-titre">{{ element.titre }}</div>
                <div class="carte-meta">


<span
  class="prio-badge"
  :class="[
    `prio-${element.priorite}`,
    {
      'badge-clignotant':
        statut === 'a_faire' &&
        estCritiqueEnRetard(element)
    }
  ]"
>

                    <svg v-if="element.priorite === 'critique'" width="9" height="9" viewBox="0 0 12 12" fill="none">
                      <path d="M6 2v4M6 8.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                      <path d="M1 10.5h10L6 1.5 1 10.5z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
                    </svg>
                    {{ labelsPriorite[element.priorite] || element.priorite }}
                  </span>
<span
  v-if="texteSLA(element, statut)"
  class="sla-badge"
  :class="niveauSLA(element, statut)"
>
  {{ texteSLA(element, statut) }}
</span>
                  <span v-if="element.echeance" class="carte-date">
                    {{ formaterDate(element.echeance) }}
                  </span>
                </div>

                <div class="carte-sep"></div>

                <div class="carte-pied">
                  <div v-if="element.assigne" class="carte-assigne">
                    <div class="avatar-xs" :style="{ background: couleurUser(element.assigne) }">
                      {{ initiales(element.assigne) }}
                    </div>
                    <span class="assigne-nom">{{ element.assigne.nom }}</span>
                    <button
                      v-if="authStore.estAdmin || authStore.estResponsable"
                      class="btn-changer-assign"
                      title="Changer le technicien"
                      @click.stop="ouvrirAssignation(element)"
                    >
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M8.5 1.5l2 2L3 11H1V9L8.5 1.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </div>

                  <button
                    v-else-if="authStore.estAdmin || authStore.estResponsable"
                    class="btn-assigner"
                    @click.stop="ouvrirAssignation(element)"
                  >
                    + Assigner
                  </button>
                  <span v-else class="non-assigne">Non assigné</span>

                  <span v-if="element.client_nom" class="carte-client">{{ element.client_nom }}</span>
                </div>
              </div>
            </template>

            <template #footer>
              <div v-if="tickets.length === 0" class="vide">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.2"/>
                  <path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                </svg>
                <span>Aucun ticket</span>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>

    <!-- Modale assignation -->
    <transition name="modal">
      <div v-if="modalAssignOuverte" class="modal-overlay" @click.self="fermerAssignation">
        <div class="modal-assign card-surface">
          <div class="modal-header">
            <div>
              <p class="modal-eyebrow">{{ ticketSelectionne?.reference }}</p>
              <h3 class="modal-titre">Assigner le ticket</h3>
            </div>
            <button class="btn-fermer" @click="fermerAssignation">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <p class="modal-ticket-titre">{{ ticketSelectionne?.titre }}</p>

          <div v-if="chargementTechs" class="techs-loading">Chargement...</div>
          <div v-else class="techs-liste">
            <button
              v-for="tech in techniciens"
              :key="tech.id"
              class="tech-item"
              :class="{ selectionne: techChoisi === tech.id }"
              @click="techChoisi = tech.id"
            >
              <div class="tech-avatar" :style="{ background: couleurUser({ id: tech.id }) }">
                {{ tech.nom.slice(0, 2).toUpperCase() }}
              </div>
              <span class="tech-nom">{{ tech.nom }}</span>
              <svg v-if="techChoisi === tech.id" class="check" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l4 4 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <div v-if="erreurAssign" class="message-erreur">{{ erreurAssign }}</div>

          <div class="modal-footer">
            <button class="btn-annuler" @click="fermerAssignation">Annuler</button>
            <button
              class="btn-confirmer"
              :disabled="!techChoisi || assignEnCours"
              @click="confirmerAssignation"
            >
              {{ assignEnCours ? 'Assignation...' : 'Confirmer' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="toast">
      <div v-if="erreurTransition" class="toast-erreur">{{ erreurTransition }}</div>
    </transition>
    <transition name="toast">
      <div v-if="toastSucces" class="toast-succes">{{ toastSucces }}</div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import draggable from 'vuedraggable';
import { useTicketsStore } from '../stores/tickets';
import { useAuthStore }    from '../stores/auth';
import BarreFiltres        from '../components/Kanban/BarreFiltres.vue';
import api                 from '../services/api';

const props = defineProps({
  drawerOuvert: { type: Boolean, default: false },
});
const emit = defineEmits(['update:drawerOuvert']);

const store     = useTicketsStore();
const authStore = useAuthStore();
const router    = useRouter();

const erreurTransition   = ref('');
const toastSucces        = ref('');
const modalAssignOuverte = ref(false);
const ticketSelectionne  = ref(null);
const techniciens        = ref([]);
const techChoisi         = ref(null);
const chargementTechs    = ref(false);
const assignEnCours      = ref(false);
const erreurAssign       = ref('');
let erreurTimer = null;
let toastTimer  = null;
const maintenant = ref(Date.now());
let timerSLA = null;

const labelsStatut = {
  a_faire:  'À faire',
  en_cours: 'En cours',
  bloque:   'Bloqué',
  resolu:   'Résolu',
};

const couleurAccent = {
  a_faire:  '#94a3b8',
  en_cours: '#3b7dd8',
  bloque:   '#f97316',
  resolu:   '#10b981',
};

const labelsPriorite = {
  critique: 'Critique',
  haute:    'Haute',
  moyenne:  'Moyenne',
  normale:  'Normale',
  basse:    'Basse',
};

// ── Couleurs avatars ──────────────────────────────────────────────────────
const palette = ['#3b7dd8', '#10b981', '#f97316', '#8b5cf6', '#ef4444', '#a855f7'];

function hashId(id) {
  if (!id) return 0;
  return String(id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

function couleurUser(user) {
  if (!user?.id) return '#1e293b';
  return palette[hashId(user.id) % palette.length];
}

function initiales(user) {
  if (!user) return '?';
  return user.nom?.slice(0, 2).toUpperCase() || '?';
}

function formaterDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
function estCritiqueEnRetard(ticket) {
  if (ticket.priorite !== 'critique') return false;

  if (ticket.assigne) return false;

  const dateCreation =
    ticket.createdAt ||
    ticket.created_at ||
    ticket.date_creation;

  if (!dateCreation) return false;

  const diffMinutes =
    (Date.now() - new Date(dateCreation).getTime()) / 60000;

  return diffMinutes >= 15;
}
function niveauSLA(ticket, statut) {
  if (!ticket.date_limite_resolution) return "";

  // Les tickets déjà résolus n'ont pas d'alerte SLA
  if (statut === "resolu") return "";

  const diff =
    new Date(ticket.date_limite_resolution).getTime() - Date.now();

  if (diff <= 0) return "carte-sla-depasse";
  if (diff <= 15 * 60 * 1000) return "carte-sla-15";
  if (diff <= 30 * 60 * 1000) return "carte-sla-30";
  if (diff <= 60 * 60 * 1000) return "carte-sla-60";

  return "";
}
function texteSLA(ticket, statut) {
  if (!ticket.date_limite_resolution) return "";

  if (statut === "resolu") return "";

  const diff =
    new Date(ticket.date_limite_resolution).getTime() - maintenant.value;

  if (diff <= 0) {
    const retard = Math.floor(Math.abs(diff) / 60000);

    if (retard < 60) {
      return `⚠ Dépassé de ${retard} min`;
    }

    const heures = Math.floor(retard / 60);
    const minutes = retard % 60;

    return `⚠ Dépassé de ${heures}h ${minutes}min`;
  }

  const minutes = Math.floor(diff / 60000);

  if (minutes >= 60) {
    const heures = Math.floor(minutes / 60);
    const reste = minutes % 60;

    return `⏳ ${heures}h ${reste}min`;
  }

  return `⏳ ${minutes} min`;
}

function appliquerFiltres(filtres) {
  store.chargerTickets(filtres);
}

// ── Drag-and-drop ─────────────────────────────────────────────────────────
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
  console.log('click', id);
  router.push(`/tickets/${id}`);
}

// ── Assignation ───────────────────────────────────────────────────────────
async function ouvrirAssignation(ticket) {
  ticketSelectionne.value = ticket;
  techChoisi.value        = ticket.assigne?.id || null;
  erreurAssign.value      = '';
  modalAssignOuverte.value = true;

  if (techniciens.value.length === 0) {
    chargementTechs.value = true;
    try {
      const res = await api.get('/users?role=technicien');
      techniciens.value = res.data.data;
    } catch (e) {
      erreurAssign.value = 'Impossible de charger les techniciens';
    } finally {
      chargementTechs.value = false;
    }
  }
}

function fermerAssignation() {
  modalAssignOuverte.value = false;
  ticketSelectionne.value  = null;
  techChoisi.value         = null;
}

async function confirmerAssignation() {
  if (!techChoisi.value) return;
  assignEnCours.value = true;
  erreurAssign.value  = '';
  try {
    await store.assignerTicket(ticketSelectionne.value.id, techChoisi.value);
    fermerAssignation();
    afficherToast('Ticket assigné avec succès');
  } catch (e) {
    erreurAssign.value = e.response?.data?.message || "Erreur lors de l'assignation";
  } finally {
    assignEnCours.value = false;
  }
}

function afficherToast(msg) {
  toastSucces.value = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastSucces.value = ''; }, 3000);
}

// ── Clavier ───────────────────────────────────────────────────────────────
function onKeydown(e) {
  if (e.key === 'Escape') {
    if (modalAssignOuverte.value) { fermerAssignation(); return; }
    if (props.drawerOuvert) emit('update:drawerOuvert', false);
  }
}

onMounted(async () => {
timerSLA = setInterval(() => {
  maintenant.value = Date.now();
}, 60000);
  await store.chargerTickets();
  window.addEventListener('keydown', onKeydown);
  window.addEventListener('refreshTickets', store.chargerTickets);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  window.removeEventListener('refreshTickets', store.chargerTickets);
  clearTimeout(erreurTimer);
  clearTimeout(toastTimer);
  clearInterval(timerSLA);
});
</script>

<style scoped>
.kanban-page {
  position: relative; min-height: 100vh; background: var(--bg);
}

/* Overlay */
.overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.35); z-index: 30; cursor: pointer; }
.overlay-fade-enter-active, .overlay-fade-leave-active { transition: opacity 0.25s ease; }
.overlay-fade-enter-from,   .overlay-fade-leave-to     { opacity: 0; }

/* Drawer */
.drawer {
  position: fixed; top: 60px; left: 0; bottom: 0; width: 300px;
  background: white; border-right: 1px solid var(--border);
  box-shadow: 4px 0 24px rgba(15,23,42,.12);
  z-index: 40; overflow-y: auto; display: flex; flex-direction: column;
}
.drawer-slide-enter-active, .drawer-slide-leave-active {
  transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
}
.drawer-slide-enter-from, .drawer-slide-leave-to { transform: translateX(-100%); }
.drawer-close { display: flex; justify-content: flex-end; padding: 10px 12px 0; }
.btn-fermer {
  background: none; border: none; cursor: pointer;
  color: #64748b; padding: 4px; border-radius: 4px;
  display: flex; align-items: center; transition: background 0.15s;
}
.btn-fermer:hover { background: #f1f5f9; color: #1e293b; }

/* Contenu */
.kanban-contenu { padding: 20px 16px; min-height: 100vh; transition: opacity 0.25s ease; }
.contenu-dimme  { opacity: 0.5; pointer-events: none; }

/* Colonnes */
.colonnes {
  display: flex; gap: 14px; align-items: flex-start;
  min-height: calc(100vh - 100px);
}

.colonne {
  flex: 1; min-width: 220px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-md); overflow: hidden;
  display: flex; flex-direction: column;
  min-height: calc(100vh - 120px);
}

.colonne-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-bottom: 1px solid var(--border);
  background: var(--surface); position: sticky; top: 0; z-index: 1;
}
.colonne-titre { display: flex; align-items: center; gap: 8px; }
.colonne-accent { width: 3px; height: 16px; border-radius: 2px; flex-shrink: 0; }
.colonne-label  { font-size: 13px; font-weight: 600; color: var(--ink); }
.compteur {
  font-size: 11px; font-weight: 600; padding: 2px 9px;
  border-radius: 999px; background: var(--bg); color: var(--ink-soft);
  border: 1px solid var(--border); min-width: 24px; text-align: center;
}

/* Zone draggable */
.zone-depot {
  flex: 1; padding: 12px; display: flex; flex-direction: column;
  gap: 10px; min-height: 200px;
}

/* Carte */
.carte {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-sm); padding: 12px 12px 0; cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
}
.carte:hover { border-color: var(--border-strong); box-shadow: var(--shadow-md); transform: translateY(-1px); }
.carte-id    { font-size: 10px; color: var(--ink-soft); font-family: monospace; letter-spacing: 0.3px; margin-bottom: 5px; }
.carte-titre { font-size: 13px; font-weight: 600; color: var(--ink); line-height: 1.45; margin-bottom: 10px; }
.carte-meta  { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }

.prio-badge {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.04em; padding: 3px 8px; border-radius: 999px;
}
.prio-critique { background: var(--danger-soft);  color: var(--danger); }
.prio-haute    { background: var(--warning-soft); color: #a16207; }
.prio-moyenne  { background: var(--warning-soft); color: #a16207; }
.prio-normale  { background: #e0f2fe; color: #0369a1; }
.prio-basse    { background: var(--success-soft);  color: var(--success); }

.carte-date { font-size: 10px; color: var(--ink-soft); }
.carte-sep  { border-top: 2px dashed var(--border); margin: 0 -12px; }
.carte-pied {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 0 10px;
}
.carte-assigne { display: flex; align-items: center; gap: 5px; }
.avatar-xs {
  width: 22px; height: 22px; border-radius: 50%; color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 8px; font-weight: 600; flex-shrink: 0;
}
.assigne-nom { font-size: 11px; color: var(--ink-soft); }
.btn-changer-assign {
  background: none; border: none; cursor: pointer; color: var(--ink-soft);
  padding: 2px; border-radius: 3px; display: flex; align-items: center;
  opacity: 0; transition: opacity 0.15s, color 0.15s;
}
.carte:hover .btn-changer-assign { opacity: 1; }
.btn-changer-assign:hover { color: var(--accent); }
.btn-assigner {
  font-size: 11px; font-weight: 600; color: var(--accent);
  background: var(--accent-soft); border: 1px dashed var(--accent);
  border-radius: 6px; padding: 3px 9px; cursor: pointer;
}
.btn-assigner:hover { background: #fed7aa; }
.non-assigne  { font-size: 11px; color: var(--ink-soft); font-style: italic; }
.carte-client {
  font-size: 10px; color: var(--ink-soft);
  max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.vide {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; padding: 40px 0; color: var(--border-strong); font-size: 12px;
}

/* Chargement */
.chargement { display: flex; gap: 6px; justify-content: center; padding: 80px 0; }
.chargement-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--accent); animation: pulse 1.2s ease-in-out infinite;
}
.chargement-dot:nth-child(2) { animation-delay: 0.2s; }
.chargement-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes pulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40%           { opacity: 1;   transform: scale(1); }
}

/* Modale assignation */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(15,23,42,0.45);
  z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-assign  { width: 100%; max-width: 380px; padding: 24px; border-radius: var(--radius-md); }
.modal-header  { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 6px; }
.modal-eyebrow { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent); margin-bottom: 2px; }
.modal-titre   { font-size: 16px; font-weight: 700; color: var(--ink); }
.modal-ticket-titre { font-size: 13px; color: var(--ink-soft); margin-bottom: 18px; line-height: 1.4; }
.techs-loading { font-size: 13px; color: var(--ink-soft); padding: 16px 0; text-align: center; }
.techs-liste   { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; max-height: 280px; overflow-y: auto; }
.tech-item {
  display: flex; align-items: center; gap: 10px;
  background: none; border: 1px solid var(--border);
  border-radius: 10px; padding: 10px 12px; cursor: pointer;
  transition: all 0.15s; text-align: left;
}
.tech-item:hover, .tech-item.selectionne { border-color: var(--accent); background: var(--accent-soft); }
.tech-avatar {
  width: 32px; height: 32px; border-radius: 50%; color: white;
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.tech-nom  { flex: 1; font-size: 13px; font-weight: 500; color: var(--ink); }
.check     { color: var(--accent); flex-shrink: 0; }
.modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
.btn-annuler  {
  background: white; border: 1px solid var(--border); color: var(--ink-soft);
  border-radius: 10px; padding: 9px 16px; font-size: 13px; font-weight: 500; cursor: pointer;
}
.btn-confirmer {
  background: var(--accent); color: white; border: none;
  border-radius: 10px; padding: 9px 18px; font-size: 13px; font-weight: 600; cursor: pointer;
}
.btn-confirmer:hover:not(:disabled) { background: #ea580c; }
.btn-confirmer:disabled { opacity: 0.5; cursor: not-allowed; }
.message-erreur { background: var(--danger-soft); color: var(--danger); padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 12px; }

/* Toasts */
.toast-erreur, .toast-succes {
  position: fixed; bottom: 24px; right: 24px;
  padding: 12px 16px; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 500; max-width: 320px;
  box-shadow: var(--shadow-md); z-index: 999; color: white;
}
.toast-erreur { background: var(--danger); }
.toast-succes { background: var(--success); }
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from,   .toast-leave-to     { opacity: 0; transform: translateY(8px); }
.modal-enter-active, .modal-leave-active  { transition: all 0.2s ease; }
.modal-enter-from,   .modal-leave-to      { opacity: 0; }


.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.carte-critique-retard {
  border: 2px solid #ef4444;
  animation: pulseCritique 1s infinite;
}

.badge-clignotant {
  animation: blinkCritique 0.8s infinite;
}

@keyframes pulseCritique {
  0% {
    box-shadow: 0 0 0 rgba(239, 68, 68, 0);
  }

  50% {
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.9);
  }

  100% {
    box-shadow: 0 0 0 rgba(239, 68, 68, 0);
  }
}

@keyframes blinkCritique {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.3;
  }

  100% {
    opacity: 1;
  }
}


/* ===== RESPONSIVE ===== */
@media (max-width: 900px) {
  .kanban-contenu { padding: 12px 10px; overflow-x: auto; }
  .colonnes {
    flex-direction: row; flex-wrap: nowrap; gap: 10px;
    overflow-x: auto; padding-bottom: 16px;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }
  .colonne {
    flex: 0 0 80vw; max-width: 80vw;
    min-width: 260px; min-height: 60vh;
    scroll-snap-align: start;
  }
}

@media (max-width: 600px) {
  .colonne { flex: 0 0 88vw; max-width: 88vw; }
  .drawer  { width: 100%; top: 60px; }
  .carte-titre { font-size: 12px; }
  .modal-assign { max-width: calc(100vw - 32px); margin: 16px; }
  .toast-erreur, .toast-succes { right: 12px; left: 12px; max-width: 100%; }

  /* Modale depuis le bas sur mobile */
  .modal-overlay { align-items: flex-end; padding: 0; }
  .modal-assign  {
    max-width: 100%; border-radius: 16px 16px 0 0;
    padding: 20px 16px 32px; max-height: 85vh; overflow-y: auto;
  }
}
/* ===================== SLA ===================== */

/* moins d'une heure */
.carte-sla-60{
  border:2px solid #facc15 !important;
}

/* moins de 30 minutes */
.carte-sla-30{
  border:2px solid #fb923c !important;
}

/* moins de 15 minutes */
.carte-sla-15{
  border:2px solid #800020 !important;
}

/* délai dépassé */
.carte-sla-depasse{
  border:2px solid #dc2626 !important;
  animation: clignotementSLA 1s infinite;
}

@keyframes clignotementSLA{

  0%{
    border-color:#dc2626;
    box-shadow:0 0 0 rgba(220,38,38,0);
  }

  50%{
    border-color:#ff3b3b;
    box-shadow:0 0 18px rgba(220,38,38,.9);
  }

  100%{
    border-color:#dc2626;
    box-shadow:0 0 0 rgba(220,38,38,0);
  }

}
.sla-badge{
  font-size:10px;
  font-weight:700;
  padding:3px 8px;
  border-radius:999px;
  border:1px solid transparent;
}

.sla-badge.carte-sla-60{
  background:#fef9c3;
  color:#a16207;
}

.sla-badge.carte-sla-30{
  background:#ffedd5;
  color:#c2410c;
}

.sla-badge.carte-sla-15{
  background:#fce7f3;
  color:#800020;
}

.sla-badge.carte-sla-depasse{
  background:#fee2e2;
  color:#b91c1c;
}

</style>