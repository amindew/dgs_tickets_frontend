<template>
  <div class="detail-ticket" v-if="ticket">
    <div class="entete">
      <span class="reference">{{ ticket.reference }}</span>
      <span :class="['badge', ticket.priorite]">{{ ticket.priorite }}</span>
      <span :class="['statut', ticket.statut]">{{ ticket.statut }}</span>
    </div>

    <h2>{{ ticket.titre }}</h2>
    <p class="description">{{ ticket.description }}</p>

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
        <p>{{ formatDate(ticket.ouvert_le) }}</p>
      </div>
    </div>

    <!-- SLA -->
    <div class="sla-block" :class="{ depasse: slaDepasse }">
      <h3>Indicateur SLA</h3>
      <p>Durée écoulée : {{ dureeEcouleeMin }} minutes</p>

      <p v-if="ticket.resolu_le">
        Résolu en : {{ ticket.duree_resolution_min }} minutes
      </p>

      <p v-else class="en-cours-sla">
        Ticket en cours de traitement
      </p>
    </div>

    <!-- TIMELINE HISTORIQUE -->
    <div class="timeline" v-if="historique.length">
      <h3>Historique des statuts</h3>

      <div
        class="timeline-item"
        v-for="h in historique"
        :key="h.id"
      >
        <div class="circle"></div>

        <div class="content">
          <p class="statut-change">
            <strong>{{ h.ancien_statut }}</strong>
            → <strong>{{ h.nouveau_statut }}</strong>
          </p>

          <p class="meta">
            Par <strong>{{ h.modificateur?.nom || 'Inconnu' }}</strong>
            • {{ formatDate(h.modifie_le) }}
          </p>
        </div>
      </div>
    </div>

    <button @click="$router.back()">Retour</button>
  </div>

  <div v-else>Chargement...</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ticketService } from '../services/ticketService';

const route = useRoute();

const ticket = ref(null);
const historique = ref([]);

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
.sla-block {
  padding: 12px;
  border-radius: 8px;
  background: #f0fdf4;
}

.sla-block.depasse {
  background: #fef2f2;
  border: 1px solid #dc2626;
}

/* TIMELINE */
.timeline {
  margin-top: 25px;
  padding: 10px;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  position: relative;
}

.circle {
  width: 10px;
  height: 10px;
  background: #4f46e5;
  border-radius: 50%;
  margin-right: 10px;
  margin-top: 6px;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 10px;
  bottom: -10px;
  width: 2px;
  background: #e5e7eb;
}

.content {
  background: #f9fafb;
  padding: 8px 12px;
  border-radius: 6px;
  width: 100%;
}

.statut-change {
  margin: 0;
}

.meta {
  font-size: 12px;
  color: gray;
}
</style>
<template>
  <!-- ... reste de la page ... -->

  <FilCommentaires :ticket-id="ticket.id" />
</template>

<script setup>
import FilCommentaires from '../components/tickets/FilCommentaires.vue';

// ... reste des imports ...
</script>