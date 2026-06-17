<template>
  <div class="creation-ticket">
    <h2>Nouveau ticket d'incident</h2>

    <div class="champ">
      <label>Titre *</label>
      <input
        v-model="form.titre"
        placeholder="Résumé de l'incident"
      />
    </div>

    <div class="champ">
      <label>Description</label>
      <textarea
        v-model="form.description"
        rows="4"
      ></textarea>
    </div>

    <div class="champ">
      <label>Priorité *</label>
      <select v-model="form.priorite">
        <option value="basse">Basse</option>
        <option value="moyenne">Moyenne</option>
        <option value="critique">Critique</option>
      </select>
    </div>

    <div class="champ">
      <label>Client</label>
      <input
        v-model="form.client_nom"
        placeholder="Nom du client"
      />
    </div>

    <div v-if="erreur" class="erreur">
      {{ erreur }}
    </div>

    <button
      @click="soumettre"
      :disabled="chargement"
    >
      {{ chargement ? 'Création...' : 'Créer le ticket' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTicketsStore } from '../stores/tickets';

const router = useRouter();
const store = useTicketsStore();

const erreur = ref('');
const chargement = ref(false);

const form = ref({
  titre: '',
  description: '',
  priorite: 'moyenne',
  client_nom: ''
});

async function soumettre() {
  // Vérification du titre
  if (!form.value.titre) {
    erreur.value = 'Le titre est obligatoire';
    return;
  }

  chargement.value = true;

  try {
    await store.creerTicket(form.value);

    // Redirection vers le tableau Kanban
    router.push('/kanban');
  } catch (e) {
    erreur.value = 'Erreur lors de la création';
  } finally {
    chargement.value = false;
  }
}
</script>
<style scoped>
.creation-ticket {
  max-width: 600px;
  margin: 30px auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.champ {
  margin-bottom: 15px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

input,
textarea,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

button {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 6px;
  background: #2563eb;
  color: white;
  cursor: pointer;
}

button:hover {
  background: #1d4ed8;
}

.erreur {
  color: red;
  margin-bottom: 10px;
}
</style>