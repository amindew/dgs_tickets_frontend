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