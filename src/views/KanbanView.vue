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
<style scoped>
.colonnes {
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow-x: auto;
}

.colonne {
  flex: 1;
  min-width: 250px;
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px;
}

.colonne-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.compteur {
  background: #3b82f6;
  color: #fff;
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 0.8rem;
  font-weight: 600;
}
</style>