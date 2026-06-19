<template>
  <div class="page" v-if="ticket">
    <div class="detail-ticket">
      <button class="btn-retour" @click="$router.back()">← Retour</button>

      <div class="card-surface bloc-principal">
        <div class="entete">
          <span class="reference mono">{{ ticket.reference }}</span>
          <span :class="['tag', ticket.priorite]">{{ ticket.priorite }}</span>
          <span :class="['tag', ticket.statut]">{{ labelsStatut[ticket.statut] }}</span>
        </div>

        <h2>{{ ticket.titre }}</h2>

        <p class="description">{{ ticket.description || 'Aucune description fournie.' }}</p>

        <div class="infos-grid">
          <div>
            <label>Client</label>
            <p>{{ ticket.client_nom }}</p>
          </div>

          <div>
            <label>Assigné à</label>
            <p>{{ ticket.assigne?.nom || 'Non assigné' }}</p>
          </div>

          <div>
            <label>Créé par</label>
            <p>{{ ticket.createur?.nom }}</p>
          </div>

          <div>
            <label>Ouvert le</label>
            <p class="mono small">{{ formatDate(ticket.ouvert_le) }}</p>
          </div>
        </div>
      </div>

      <div class="card-surface sla-block" :class="{ depasse: slaDepasse }">
        <div class="sla-header">
          <h3>Indicateur SLA</h3>
          <span class="sla-pastille" :class="{ depasse: slaDepasse }">
            {{ slaDepasse ? 'Délai dépassé' : 'Dans les délais' }}
          </span>
        </div>

        <p class="sla-duree mono">{{ dureeEcouleeMin }} min</p>

        <p v-if="ticket.resolu_le" class="sla-detail">
          Résolu en {{ ticket.duree_resolution_min }} minutes
        </p>
        <p v-else class="sla-detail en-cours-sla">
          Ticket en cours de traitement
        </p>
      </div>

      <div class="card-surface timeline-block" v-if="historique.length">
        <h3>Historique des statuts</h3>

        <div class="timeline">
          <div class="timeline-item" v-for="h in historique" :key="h.id">
            <div class="circle"></div>

            <div class="content">
              <p class="statut-change">
                <span :class="['tag', h.ancien_statut]">{{ labelsStatut[h.ancien_statut] }}</span>
                →
                <span :class="['tag', h.nouveau_statut]">{{ labelsStatut[h.nouveau_statut] }}</span>
              </p>

              <p class="meta">
                Par <strong>{{ h.modificateur?.nom || 'Inconnu' }}</strong>
                <span class="mono"> · {{ formatDate(h.modifie_le) }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="card-surface commentaires-block">
        <FilCommentaires :ticket-id="ticket.id" />
      </div>
    </div>
  </div>

  <div v-else class="chargement-page">
    Chargement...
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ticketService } from '../services/ticketService';
import FilCommentaires from '../components/tickets/FilCommentaires.vue';

const route = useRoute();

const ticket = ref(null);
const historique = ref([]);

const labelsStatut = {
  a_faire: 'À faire',
  en_cours: 'En cours',
  bloque: 'Bloqué',
  resolu: 'Résolu',
};

const dureeEcouleeMin = computed(() => {
  if (!ticket.value) return 0;

  const debut = new Date(ticket.value.ouvert_le);

  const fin = ticket.value.resolu_le
    ? new Date(ticket.value.resolu_le)
    : new Date();

  return Math.round((fin - debut) / 60000);
});

const slaDepasse = computed(() => dureeEcouleeMin.value > 120);

function formatDate(date) {
  return new Date(date).toLocaleString('fr-FR');
}

onMounted(async () => {
  ticket.value = await ticketService.getDetail(route.params.id);
  historique.value = await ticketService.getHistorique(route.params.id);
});
</script>

<style scoped>
.page {
  padding: 28px 20px 60px;
  display: flex;
  justify-content: center;
}

.chargement-page {
  text-align: center;
  padding: 60px;
  font-family: var(--font-mono);
  color: var(--ink-soft);
}

.detail-ticket {
  width: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn-retour {
  align-self: flex-start;
  background: none;
  border: none;
  color: var(--ink-soft);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 0;
}

.btn-retour:hover {
  color: var(--ink);
}

.bloc-principal {
  padding: 26px 28px;
}

.entete {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.reference {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-soft);
}

h2 {
  font-size: 22px;
  margin-bottom: 12px;
}

.description {
  color: var(--ink-soft);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 22px;
}

.infos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}

.infos-grid label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #9aa1ad;
  margin-bottom: 3px;
}

.infos-grid p {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.small { font-size: 12.5px; }

/* SLA */
.sla-block {
  padding: 20px 24px;
  border-left: 4px solid var(--success);
}

.sla-block.depasse {
  border-left-color: var(--danger);
}

.sla-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sla-header h3 { font-size: 14px; }

.sla-pastille {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 99px;
  background: var(--success-soft);
  color: var(--success);
}

.sla-pastille.depasse {
  background: var(--danger-soft);
  color: var(--danger);
}

.sla-duree {
  font-size: 28px;
  font-weight: 600;
  margin: 10px 0 4px;
}

.sla-detail {
  font-size: 12.5px;
  color: var(--ink-soft);
  margin: 0;
}

/* TIMELINE */
.timeline-block {
  padding: 22px 24px;
}

.timeline-block h3 {
  font-size: 14px;
  margin-bottom: 16px;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 14px;
  position: relative;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.circle {
  width: 9px;
  height: 9px;
  background: var(--accent);
  border-radius: 50%;
  margin-right: 12px;
  margin-top: 5px;
  flex-shrink: 0;
}

.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 12px;
  bottom: -14px;
  width: 1.5px;
  background: var(--border);
}

.content {
  background: var(--bg);
  padding: 9px 13px;
  border-radius: var(--radius-sm);
  width: 100%;
}

.statut-change {
  margin: 0 0 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.meta {
  font-size: 11.5px;
  color: var(--ink-soft);
  margin: 0;
}

.commentaires-block {
  padding: 22px 24px;
}
</style>