<template>
  <div class="kanban">
    <BarreFiltres @filtrer="appliquerFiltres" />

    <div v-if="store.chargement">
      Chargement...
    </div>

    <div
      v-else
      class="colonnes"
    >
      <div
        v-for="(tickets, statut) in store.tickets"
        :key="statut"
        class="colonne"
      >
        <div class="colonne-header">
          <h3>{{ labelsStatut[statut] }}</h3>

          <span class="compteur">
            {{ tickets.length }}
          </span>
        </div>

        <draggable
          :list="tickets"
          group="tickets"
          item-key="id"
          class="zone-depot"
          @change="onChange($event, statut)"
        >
          <template #item="{ element }">
            <CarteTicket
              :ticket="element"
              @click="voirDetail(element.id)"
            />
          </template>
        </draggable>
      </div>
    </div>

    <div
      v-if="erreurTransition"
      class="erreur-transition"
    >
      {{ erreurTransition }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import draggable from 'vuedraggable';

import { useTicketsStore } from '../stores/tickets';

import CarteTicket from '../components/kanban/CarteTicket.vue';
import BarreFiltres from '../components/kanban/BarreFiltres.vue';

const store = useTicketsStore();
const router = useRouter();

const erreurTransition = ref('');

const labelsStatut = {
  a_faire: 'À faire',
  en_cours: 'En cours',
  bloque: 'Bloqué',
  resolu: 'Résolu'
};

function appliquerFiltres(filtres) {
  store.chargerTickets(filtres);
}

async function onChange(event, nouveauStatut) {
  if (!event.added) return;

  const ticket = event.added.element;

  erreurTransition.value = '';

  try {
    await store.changerStatut(
      ticket.id,
      nouveauStatut
    );
  } catch (error) {
    erreurTransition.value =
      error.response?.data?.message ||
      'Transition non autorisée';

    await store.chargerTickets();
  }
}

function voirDetail(id) {
  router.push(`/tickets/${id}`);
}

onMounted(async () => {
  await store.chargerTickets();

  console.log('STORE =', store.tickets);
});
</script>

<style scoped>
.kanban {
  padding: 20px;
}

.colonnes {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  min-height: 80vh;
}

.colonne {
  flex: 1;
  min-width: 260px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
}

.colonne-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.zone-depot {
  min-height: 100px;
  padding: 4px;
}

.compteur {
  background: #2563eb;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.erreur-transition {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #dc2626;
  color: white;
  padding: 12px;
  border-radius: 8px;
  max-width: 300px;
}
</style>