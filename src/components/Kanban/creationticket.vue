<template>
  <div :class="['carte', `priorite-${ticket.priorite}`]">
    <div class="carte-header">
      <span class="reference">
        {{ ticket.reference }}
      </span>

      <span :class="['badge', ticket.priorite]">
        {{ ticket.priorite }}
      </span>
    </div>

    <h4>
      {{ ticket.titre }}
    </h4>

    <div
      class="assignation-rapide"
      v-if="peutAssigner"
    >
      <select
        v-if="!ticket.assigne_id"
        @change="assignerRapide($event.target.value)"
        @click.stop
      >
        <option value="">
          Assigner à...
        </option>

        <option
          v-for="tech in techniciens"
          :key="tech.id"
          :value="tech.id"
        >
          {{ tech.nom }}
        </option>
      </select>

      <span v-else>
        Assigné : {{ ticket.assigne?.nom }}
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

async function assignerRapide(assigneId) {
  if (!assigneId) return;

  await ticketsStore.assignerTicket(
    props.ticket.id,
    assigneId
  );
}
</script>