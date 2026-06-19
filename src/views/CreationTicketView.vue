<template>
  <div class="creation-ticket">
    <h2>Nouveau ticket d'incident</h2>

    <div class="champ">
      <label>Titre *</label>
      <input v-model="form.titre" placeholder="Résumé de l'incident" />
    </div>

    <div class="champ">
      <label>Description</label>
      <textarea v-model="form.description" rows="4"></textarea>
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
      <label>Client *</label>
      <input v-model="form.client_nom" placeholder="Nom du client" />
    </div>

    <!-- ✅ Email NON obligatoire -->
    <div class="champ">
      <label>Email client</label>
      <input
        type="email"
        v-model="form.client_email"
        placeholder="Optionnel"
      />
    </div>

    <div class="champ">
      <label>Téléphone client *</label>
      <input
        type="tel"
        v-model="form.client_telephone"
        placeholder="771234567"
      />
    </div>

    <div v-if="erreur" class="erreur">
      {{ erreur }}
    </div>

    <div class="actions">
      <button
        type="button"
        class="btn-annuler"
        @click="annuler"
        :disabled="chargement"
      >
        Annuler
      </button>

      <button
        class="btn-creer"
        @click="soumettre"
        :disabled="chargement"
      >
        {{ chargement ? 'Création...' : 'Créer le ticket' }}
      </button>
    </div>
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
  client_nom: '',
  client_email: '',
  client_telephone: ''
});

const soumettre = async () => {
  erreur.value = '';

  //  Champs obligatoires
  if (!form.value.titre || !form.value.client_nom || !form.value.client_telephone) {
    erreur.value = 'Tous les champs marqués * sont obligatoires';
    return;
  }

  // Validation téléphone Sénégal
  const phoneRegex = /^(77|76|78|70|75)[0-9]{7}$/;
  if (!phoneRegex.test(form.value.client_telephone)) {
    erreur.value = 'Numéro invalide (ex: 771234567)';
    return;
  }

  //  Email optionnel mais valide si rempli
  if (form.value.client_email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.value.client_email)) {
      erreur.value = 'Email invalide';
      return;
    }
  }

  chargement.value = true;

  try {
    // envoyer null si email vide
    const data = {
      ...form.value,
      client_email: form.value.client_email || null
    };

    await store.creerTicket(data);
    router.push('/kanban');
  } catch (e) {
    erreur.value = 'Erreur lors de la création du ticket';
  } finally {
    chargement.value = false;
  }
};

const annuler = () => {
  router.push('/kanban');
};
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

.actions {
  display: flex;
  gap: 12px;
}

.actions button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-creer {
  background: #2563eb;
  color: white;
}

.btn-creer:hover {
  background: #1d4ed8;
}

.btn-annuler {
  background: #e5e7eb;
  color: #374151;
}

.btn-annuler:hover {
  background: #d1d5db;
}

.erreur {
  color: red;
  margin-bottom: 10px;
}
</style>