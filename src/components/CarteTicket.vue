<template>
  <div class="carte-ticket" :class="ticket.priorite" @click="$emit('click')">
    <div class="carte-entete">
      <span class="reference">{{ ticket.reference }}</span>
      <span class="badge-priorite" :class="ticket.priorite">{{ ticket.priorite }}</span>
    </div>
    <h4 class="titre">{{ ticket.titre }}</h4>
    <p class="client">{{ ticket.client_nom }}</p>
  </div>
</template>

<script setup>
defineProps({
  ticket: {
    type: Object,
    required: true,
  },
});

defineEmits(['click']);
</script>

<style scoped>
.carte-ticket {
  background: #fff;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  cursor: pointer;
  border-left: 4px solid #9ca3af;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.1s ease;
}

.carte-ticket:hover {
  transform: translateY(-2px);
}

.carte-ticket.critique {
  border-left-color: #dc2626;
}

.carte-ticket.moyenne {
  border-left-color: #f97316;
}

.carte-ticket.basse {
  border-left-color: #16a34a;
}

.carte-entete {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.reference {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
}

.badge-priorite {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  color: #fff;
}

.badge-priorite.critique {
  background: #dc2626;
}

.badge-priorite.moyenne {
  background: #f97316;
}

.badge-priorite.basse {
  background: #16a34a;
}

.titre {
  font-size: 0.9rem;
  margin: 4px 0;
}

.client {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
}
</style>
