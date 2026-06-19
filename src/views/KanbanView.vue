<template>
  <div class="kanban">
    <div v-if="store.chargement">
      Chargement...
    </div>

    <div v-else class="colonnes">
      <div
        class="colonne"
        v-for="(tickets, statut) in store.tickets"
        :key="statut"
      >
        <div class="colonne-header">
          <h3>{{ labelsStatut[statut] }}</h3>
          <span class="compteur">{{ tickets.length }}</span>
        </div>

        <draggable
          :list="tickets"
          group="tickets"
          item-key="id"
          @change="onChange($event, statut)"
          class="zone-depot"
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

const store = useTicketsStore();
const router = useRouter();

const erreurTransition = ref('');

const labelsStatut = {
  a_faire: 'A faire',
  en_cours: 'En cours',
  bloque: 'Bloque',
  resolu: 'Resolu',
};

// Déclenché quand une carte est déposée dans une nouvelle colonne
async function onChange(event, nouveauStatut) {
  // Si la carte est déposée dans la même colonne, rien à faire
  if (!event.added) return;

  const ticket = event.added.element;
  erreurTransition.value = '';

  try {
    // Appel API pour changer le statut (RG-02)
    await store.changerStatut(ticket.id, nouveauStatut);
  } catch (error) {
    // Si transition interdite : afficher l'erreur et recharger
    erreurTransition.value =
      error.response?.data?.message ||
      'Transition non autorisee';

    // Recharger pour remettre la carte à sa place d'origine
    await store.chargerTickets();
  }
}

function voirDetail(id) {
  router.push(`/tickets/${id}`);
}

onMounted(() => {
  store.chargerTickets();
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

.zone-depot {
  min-height: 100px;
  padding: 4px;
}

.colonne-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
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