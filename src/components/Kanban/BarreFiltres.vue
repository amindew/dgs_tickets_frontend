<template>
  <div class="barre-filtres">
    <select
      v-model="filtres.priorite"
      @change="emettreFiltres"
    >
      <option value="">
        Toutes priorités
      </option>

      <option value="critique">
        Critique
      </option>

      <option value="moyenne">
        Moyenne
      </option>

      <option value="basse">
        Basse
      </option>
    </select>

    <select
      v-model="filtres.agent"
      @change="emettreFiltres"
    >
      <option value="">
        Tous les techniciens
      </option>

      <option
        v-for="tech in techniciens"
        :key="tech.id"
        :value="tech.id"
      >
        {{ tech.nom }}
      </option>
    </select>

    <input
      type="text"
      v-model="filtres.client"
      placeholder="Rechercher un client..."
      @input="emettreFiltresDebounce"
    />

    <button
      @click="reinitialiser"
      class="btn-reset"
    >
      Réinitialiser
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../services/api';

const emit = defineEmits(['filtrer']);

const techniciens = ref([]);

const filtres = ref({
  priorite: '',
  agent: '',
  client: ''
});

let timeoutId = null;

function emettreFiltres() {
  emit('filtrer', { ...filtres.value });
}

// Debounce : attendre 400 ms après la dernière frappe
function emettreFiltresDebounce() {
  clearTimeout(timeoutId);

  timeoutId = setTimeout(() => {
    emettreFiltres();
  }, 400);
}

function reinitialiser() {
  filtres.value = {
    priorite: '',
    agent: '',
    client: ''
  };

  emettreFiltres();
}

onMounted(async () => {
  const res = await api.get('/users?role=technicien');
  techniciens.value = res.data.data;
});
</script>

<style scoped>
.barre-filtres {
  display: flex;
  gap: 10px;
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.barre-filtres select,
.barre-filtres input {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.btn-reset {
  background: #f1f5f9;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}
</style>