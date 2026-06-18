<template>
  <div class="detail-ticket" v-if="ticket">
    <div class="entete">
      <span class="reference">{{ ticket.reference }}</span>

      <span :class="['badge', ticket.priorite]">
        {{ ticket.priorite }}
      </span>

      <span :class="['statut', ticket.statut]">
        {{ ticket.statut }}
      </span>
    </div>

    <h2>{{ ticket.titre }}</h2>

    <p class="description">
      {{ ticket.description }}
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
        <p>{{ ticket.createur?.nom }}</p>
      </div>

      <div>
        <label>Ouvert le</label>
        <p>{{ formatDate(ticket.ouvert_le) }}</p>
      </div>
    </div>

    <div class="sla-block" :class="{ depasse: slaDepasse }">
      <h3>Indicateur SLA</h3>

      <p>
        Durée écoulée : {{ dureeEcouleeMin }} minutes
      </p>

      <p v-if="ticket.resolu_le">
        Résolu en : {{ ticket.duree_resolution_min }} minutes
      </p>

      <p v-else class="en-cours-sla">
        Ticket en cours de traitement
      </p>
    </div>

    <button @click="$router.back()">
      Retour
    </button>
  </div>

  <div v-else>
    Chargement...
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ticketService } from '../services/ticketService';

const route = useRoute();
const ticket = ref(null);

// Calcul de la durée écoulée depuis l'ouverture
const dureeEcouleeMin = computed(() => {
  if (!ticket.value) return 0;

  const debut = new Date(ticket.value.ouvert_le);

  const fin = ticket.value.resolu_le
    ? new Date(ticket.value.resolu_le)
    : new Date();

  return Math.round((fin - debut) / 60000);
});

// SLA dépassé si plus de 120 minutes (2 heures)
const slaDepasse = computed(() => {
  return dureeEcouleeMin.value > 120;
});

function formatDate(date) {
  return new Date(date).toLocaleString('fr-FR');
}

onMounted(async () => {
  ticket.value = await ticketService.getDetail(route.params.id);
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
</style>