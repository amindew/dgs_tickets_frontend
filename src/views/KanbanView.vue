<template>
  <div class="kanban">
    <div v-if="store.chargement">Chargement des tickets...</div>
    <div v-else class="colonnes">
      <div class="colonne" v-for="(tickets, statut) in store.tickets" :key="statut">
        <div class="colonne-header">
          <h3>{{ labelsStatut[statut] }}</h3>
          <span class="compteur">{{ tickets.length }}</span>
        </div>
        <CarteTicket
          v-for="ticket in tickets"
          :key="ticket.id"
          :ticket="ticket"
          @click="voirDetail(ticket.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTicketsStore } from '../stores/tickets';
import CarteTicket from '../components/CarteTicket.vue';

const store = useTicketsStore();
const router = useRouter();

const labelsStatut = {
  a_faire: 'A faire',
  en_cours: 'En cours',
  bloque: 'Bloque',
  resolu: 'Resolu',
};

function voirDetail(id) {
  router.push(`/tickets/${id}`);
}

onMounted(() => store.chargerTickets());
</script>