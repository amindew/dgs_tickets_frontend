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

    <h4>{{ ticket.titre }}</h4>

    <p class="client">
      Client : {{ ticket.client_nom }}
    </p>

    <p class="assigne">
      Assigné à : {{ ticket.assigne?.nom || 'Non assigné' }}
    </p>

    <div class="sla">
      Ouvert le : {{ formatDate(ticket.ouvert_le) }}
    </div>

  </div>
</template>

<script setup>
const props = defineProps({
  ticket: Object
});

function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR');
}
</script>

<style scoped>
.carte {
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 8px;
}

.priorite-critique {
  border-left: 4px solid #dc2626;
}

.priorite-moyenne {
  border-left: 4px solid #ea580c;
}

.priorite-basse {
  border-left: 4px solid #16a34a;
}

.badge.critique {
  background: #fee2e2;
  color: #dc2626;
}

.badge.moyenne {
  background: #ffedd5;
  color: #ea580c;
}

.badge.basse {
  background: #dcfce7;
  color: #16a34a;
}
</style>