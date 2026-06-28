<template>
  <div :class="['carte', `priorite-${ticket.priorite}`]">
    <div class="carte-header">
      <span class="reference mono">{{ ticket.reference }}</span>
      <span :class="['tag', ticket.priorite]">{{ ticket.priorite }}</span>
    </div>

    <div class="perforation" aria-hidden="true"></div>

    <h4>{{ ticket.titre }}</h4>

    <div class="assignation-rapide" v-if="peutAssigner">
      <select
        v-if="!ticket.assigne_id"
        @change="assignerRapide($event.target.value)"
        @click.stop
      >
        <option value="">Assigner à...</option>
        <option v-for="tech in techniciens" :key="tech.id" :value="tech.id">
          {{ tech.nom }}
        </option>
      </select>

      <span v-else class="assigne-label">
        <span class="avatar">{{ initiale(ticket.assigne?.nom) }}</span>
        {{ ticket.assigne?.nom }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useTicketsStore } from '../../stores/tickets';


const props = defineProps({
  ticket: Object,
  techniciens: Array,
});

const authStore = useAuthStore();
const ticketsStore = useTicketsStore();

const peutAssigner = computed(() =>
  authStore.estAdmin || authStore.estResponsable
);

function initiale(nom) {
  return nom ? nom.trim().charAt(0).toUpperCase() : '?';
}

async function assignerRapide(assigneId) {
  if (!assigneId) return;

  await ticketsStore.assignerTicket(
    props.ticket.id,
    assigneId
  );
}
</script>

<style scoped>
.carte {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px 14px 12px;
  margin-bottom: 10px;
  cursor: grab;
  transition: box-shadow 0.15s ease, transform 0.15s ease, border-color 0.15s ease;
  border-left: 4px solid var(--border-strong);
}

.carte:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.priorite-critique { border-left-color: var(--danger); }
.priorite-moyenne { border-left-color: var(--warning); }
.priorite-basse { border-left-color: var(--success); }

.carte-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reference {
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-soft);
}

.perforation {
  border-top: 1.5px dashed var(--border);
  margin: 10px 0;
}

h4 {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 14px;
  margin: 0 0 8px;
  color: var(--ink);
  line-height: 1.35;
}

.assignation-rapide select {
  width: 100%;
  font-size: 12.5px;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1.5px solid var(--border);
  color: var(--ink-soft);
  background: var(--bg);
}

.assigne-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--ink-soft);
  font-weight: 500;
}

.avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--navy-soft);
  color: #fff;
  font-size: 10.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
}
</style>