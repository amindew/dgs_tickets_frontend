<template>
  <div class="kanban">
    <div v-if="store.chargement" class="chargement">
      Chargement du tableau...
    </div>

    <div v-else class="colonnes">
      <div
        class="colonne"
        v-for="(tickets, statut) in store.tickets"
        :key="statut"
      >
        <div class="colonne-header">
          <span :class="['dot', statut]"></span>
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

          <template #footer>
            <p v-if="tickets.length === 0" class="colonne-vide">
              Aucun ticket
            </p>
          </template>
        </draggable>
      </div>
    </div>

    <transition name="fade-up">
      <div v-if="erreurTransition" class="erreur-transition">
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
import CarteTicket from '../components/kanban/CarteTicket.vue';

const store = useTicketsStore();
const router = useRouter();

const erreurTransition = ref('');

const labelsStatut = {
  a_faire: 'À faire',
  en_cours: 'En cours',
  bloque: 'Bloqué',
  resolu: 'Résolu',
};

async function onChange(event, nouveauStatut) {
  if (!event.added) return;

  const ticket = event.added.element;
  erreurTransition.value = '';

  try {
    await store.changerStatut(ticket.id, nouveauStatut);
  } catch (error) {
    erreurTransition.value =
      error.response?.data?.message ||
      'Transition non autorisee';

    await store.chargerTickets();

    setTimeout(() => (erreurTransition.value = ''), 4000);
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
  padding: 24px 28px;
}

.chargement {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--ink-soft);
  padding: 40px 0;
  text-align: center;
}

.colonnes {
  display: flex;
  gap: 18px;
  overflow-x: auto;
  align-items: flex-start;
}

.colonne {
  flex: 1;
  min-width: 270px;
  background: #ebedf1;
  border-radius: var(--radius-lg);
  padding: 14px;
}

.colonne-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  padding: 0 2px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot.a_faire { background: var(--ink-soft); }
.dot.en_cours { background: var(--warning); }
.dot.bloque { background: var(--danger); }
.dot.resolu { background: var(--success); }

.colonne-header h3 {
  font-size: 13.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--ink);
  flex: 1;
}

.compteur {
  font-family: var(--font-mono);
  background: var(--surface);
  color: var(--ink-soft);
  border-radius: 99px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11.5px;
  font-weight: 600;
  border: 1px solid var(--border);
}

.zone-depot {
  min-height: 120px;
}

.colonne-vide {
  text-align: center;
  font-size: 12px;
  color: #aab0bb;
  padding: 18px 0;
  border: 1.5px dashed var(--border-strong);
  border-radius: var(--radius-sm);
}

.erreur-transition {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--navy);
  color: #fff;
  padding: 14px 18px;
  border-radius: var(--radius-md);
  max-width: 320px;
  font-size: 13px;
  box-shadow: var(--shadow-lg);
  border-left: 4px solid var(--danger);
}

.fade-up-enter-active, .fade-up-leave-active {
  transition: all 0.25s ease;
}
.fade-up-enter-from, .fade-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>