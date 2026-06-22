<template>
  <div class="page">
    <div class="creation-ticket card-surface">
      <div class="entete-form">
        <span class="eyebrow mono">Nouveau signalement</span>
        <h2>Nouveau ticket d'incident</h2>
      </div>

      <div class="champ">
        <label>Titre *</label>
        <input v-model="form.titre" placeholder="Résumé de l'incident" />
      </div>

      <div class="champ">
        <label>Description</label>
        <textarea v-model="form.description" rows="4" placeholder="Détails utiles à la résolution..."></textarea>
      </div>

      <div class="champ">
        <label>Priorité *</label>
        <select v-model="form.priorite">
          <option value="basse">Basse</option>
          <option value="moyenne">Moyenne</option>
          <option value="critique">Critique</option>
        </select>
      </div>

      <div class="grille-2">
        <div class="champ">
          <label>Client *</label>
          <input v-model="form.client_nom" placeholder="Nom du client" />
        </div>

        <div class="champ">
          <label>Téléphone client *</label>
          <input type="tel" v-model="form.client_telephone" placeholder="771234567" />
        </div>
      </div>

      <div class="champ">
        <label>Email client <span class="optionnel">(optionnel)</span></label>
        <input type="email" v-model="form.client_email" placeholder="client@exemple.sn" />
      </div>

      <div v-if="erreur" class="message-erreur">{{ erreur }}</div>

      <div class="actions">
        <button type="button" class="btn btn-secondary" @click="annuler" :disabled="chargement">
          Annuler
        </button>

        <button class="btn btn-primary" @click="soumettre" :disabled="chargement">
          {{ chargement ? 'Création...' : 'Créer le ticket' }}
        </button>
      </div>
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

  if (!form.value.titre || !form.value.client_nom || !form.value.client_telephone) {
    erreur.value = 'Tous les champs marqués * sont obligatoires';
    return;
  }

  const phoneRegex = /^(77|76|78|70|75)[0-9]{7}$/;
  if (!phoneRegex.test(form.value.client_telephone)) {
    erreur.value = 'Numéro invalide (ex: 771234567)';
    return;
  }

  if (form.value.client_email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.value.client_email)) {
      erreur.value = 'Email invalide';
      return;
    }
  }

  chargement.value = true;

  try {
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
.page {
  padding: 36px 20px 60px;
  display: flex;
  justify-content: center;
}

.creation-ticket {
  width: 100%;
  max-width: 560px;
  padding: 32px 32px 28px;
}

.entete-form {
  margin-bottom: 24px;
}

.eyebrow {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--accent);
}

.entete-form h2 {
  font-size: 21px;
  margin-top: 6px;
}

.grille-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.optionnel {
  text-transform: none;
  font-weight: 400;
  color: #9aa1ad;
  letter-spacing: 0;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 6px;
}

.actions .btn {
  flex: 1;
}

@media (max-width: 480px) {
  .grille-2 {
    grid-template-columns: 1fr;
  }
}
</style>