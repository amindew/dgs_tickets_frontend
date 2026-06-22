<template>
  <div class="barre-filtres">

    <!-- PRIORITÉ -->
    <select v-model="filtres.priorite" @change="emettreFiltres">
      <option value="">Toutes priorités</option>
      <option value="critique">Critique</option>
      <option value="moyenne">Moyenne</option>
      <option value="basse">Basse</option>
    </select>

    <!-- TECHNICIEN -->
    <select v-model="filtres.agent" @change="emettreFiltres">
      <option value="">Tous les techniciens</option>

      <option
        v-for="tech in techniciens"
        :key="tech.id"
        :value="tech.id"
      >
        {{ tech.nom }}
      </option>
    </select>

    <!-- CLIENT -->
    <input
      type="text"
      v-model="filtres.client"
      placeholder="Rechercher un client..."
      @input="emettreFiltresDebounce"
    />

   <!-- DATE DÉBUT -->
<div class="filtre-date">
  <label>Date début</label>
  <input
    type="date"
    v-model="filtres.date_debut"
    @change="emettreFiltres"
  />
</div>

<!-- DATE FIN -->
<div class="filtre-date">
  <label>Date fin</label>
  <input
    type="date"
    v-model="filtres.date_fin"
    @change="emettreFiltres"
  />
</div>

    <!-- RESET -->
    <button @click="reinitialiser" class="btn-reset">
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
  client: '',
  date_debut: '',
  date_fin: ''
});

let timeoutId = null;

/* envoi filtres */
function emettreFiltres() {
  emit('filtrer', { ...filtres.value });
}

/* debounce recherche client */
function emettreFiltresDebounce() {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    emettreFiltres();
  }, 400);
}

/* reset filtres */
function reinitialiser() {
  filtres.value = {
    priorite: '',
    agent: '',
    client: '',
    date_debut: '',
    date_fin: ''
  };

  emettreFiltres();
}

/* charger techniciens */
onMounted(async () => {
  try {
    const res = await api.get('/users?role=technicien');
    techniciens.value = res.data.data;
  } catch (e) {
    console.error('Erreur chargement techniciens', e);
  }
});
</script>

<style scoped>
.barre-filtres {
  display: flex;
  flex-wrap: wrap;
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
  font-size: 13px;
}

.btn-reset {
  background: #f1f5f9;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-reset:hover {
  background: #e2e8f0;
}
</style>