<template>
  <div class="page" v-if="ticket">
    <div class="detail-ticket">

      <button class="btn-retour" @click="$router.back()">
        ← Retour
      </button>

      <!-- CARD PRINCIPALE -->
      <div class="card-surface">

        <div class="entete">
          <span class="reference">{{ ticket.reference }}</span>
          <span :class="['tag', ticket.priorite]">{{ ticket.priorite }}</span>
          <span :class="['tag', ticket.statut]">
            {{ labelsStatut[ticket.statut] }}
          </span>
        </div>

        <h2>{{ ticket.titre }}</h2>

        <p class="description">
          {{ ticket.description || 'Aucune description fournie.' }}
        </p>

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
            <p>{{ ticket.createur?.nom || 'Inconnu' }}</p>
          </div>

          <div>
            <label>Ouvert le</label>
            <p>{{ formatDate(ticket.ouvert_le) }}</p>
          </div>
        </div>

      </div>

      <!-- SLA -->
      <div class="card-surface sla-block" :class="{ depasse: slaDepasse }">
        <h3>Indicateur SLA</h3>

        <p class="sla-duree">{{ dureeEcouleeMin }} min</p>

        <p v-if="ticket.resolu_le" class="sla-detail">
          Résolu en {{ ticket.duree_resolution_min }} minutes
        </p>

        <p v-else class="sla-detail">
          Ticket en cours de traitement
        </p>
      </div>

      <!-- HISTORIQUE -->
      <div class="card-surface timeline-block" v-if="historique.length">
        <h3>Historique des statuts</h3>

        <div class="timeline">
          <div
            class="timeline-item"
            v-for="h in historique"
            :key="h.id"
          >
            <div class="circle"></div>

            <div class="content">
              <p class="statut-change">
                <span :class="['tag', h.ancien_statut]">
                  {{ labelsStatut[h.ancien_statut] }}
                </span>
                →
                <span :class="['tag', h.nouveau_statut]">
                  {{ labelsStatut[h.nouveau_statut] }}
                </span>
              </p>

              <p class="meta">
                Par <strong>{{ h.modificateur?.nom || 'Inconnu' }}</strong>
                · {{ formatDate(h.modifie_le) }}
              </p>
            </div>

          </div>
        </div>
      </div>

      <!-- COMMENTAIRES -->
      <div class="card-surface commentaires-block">
        <FilCommentaires :ticket-id="ticket.id" />
      </div>

      <!-- UPLOAD -->
      <div class="card-surface commentaires-block">
        <ZoneUpload :ticket-id="ticket.id" />
      </div>

      <button class="btn-retour" @click="$router.back()">
        Retour
      </button>

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
import ZoneUpload from '../components/tickets/ZoneUpload.vue';

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

const slaDepasse = computed(() => {
  return dureeEcouleeMin.value > 120;
});

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
  background: #f6f8fc;
  min-height: 100vh;
}

.detail-ticket {
  width: 100%;
  max-width: 780px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-surface {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.btn-retour {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  font-weight: 600;
}

/* ENTETE */
.entete {
  display: flex;
  gap: 8px;
  align-items: center;
}

.reference {
  font-size: 12px;
  color: #6b7280;
}

/* TAGS */
.tag {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
  font-weight: 600;
  text-transform: uppercase;
}

.tag.a_faire { background: #e0f2fe; color: #0284c7; }
.tag.en_cours { background: #fef9c3; color: #a16207; }
.tag.bloque { background: #fee2e2; color: #dc2626; }
.tag.resolu { background: #dcfce7; color: #16a34a; }

/* INFOS */
.infos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 15px;
}

.infos-grid label {
  font-size: 11px;
  color: #9ca3af;
}

/* SLA */
.sla-block {
  background: #f0fdf4;
  border-left: 4px solid #22c55e;
  border-radius: 10px;
  padding: 16px;
}

.sla-block.depasse {
  background: #fef2f2;
  border-left-color: #ef4444;
}

.sla-duree {
  font-size: 26px;
  font-weight: bold;
}

/* TIMELINE */
.timeline-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.circle {
  width: 10px;
  height: 10px;
  background: #6366f1;
  border-radius: 50%;
  margin-top: 6px;
}

.content {
  background: #f9fafb;
  padding: 10px;
  border-radius: 8px;
  width: 100%;
}

/* LOADING */
.chargement-page {
  text-align: center;
  padding: 60px;
  color: #6b7280;
}
</style>