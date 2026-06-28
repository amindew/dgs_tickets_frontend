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
      <div class="champ">
  <label>Date limite de résolution <span class="optionnel">(optionnel)</span></label>
 <input
  type="datetime-local"
  v-model="form.date_limite_resolution"
  :disabled="!form.assigne_id"
/>

<span
  v-if="!form.assigne_id"
  class="hint-info"
>
  Assignez d'abord un technicien pour pouvoir définir une date limite de résolution.
</span>
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
        <input
          type="email"
          v-model="form.client_email"
          placeholder="client@exemple.sn"
          :class="{ 'input-erreur': emailClientInvalide }"
          @blur="validerEmailClient"
        />
        <span v-if="emailClientInvalide" class="hint-erreur">Format invalide (ex: nom@domaine.sn)</span>
      </div>

      <!-- Assignation technicien -->
      <div class="champ">
        <label>Assigner à un technicien <span class="optionnel">(optionnel)</span></label>
        <select v-model="form.assigne_id">
          <option value="">— Non assigné —</option>
          <option v-for="tech in techniciens" :key="tech.id" :value="tech.id">
            {{ tech.nom }}
          </option>
        </select>
        <span v-if="chargementTechs" class="hint-info">Chargement des techniciens...</span>
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
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useTicketsStore } from '../stores/tickets';
import api from '../services/api';

const router = useRouter();
const store  = useTicketsStore();

const erreur      = ref('');
const chargement  = ref(false);
const techniciens = ref([]);
const chargementTechs    = ref(false);
const emailClientInvalide = ref(false);

const form = ref({
  titre: '',
  description: '',
  priorite: 'moyenne',
  client_nom: '',
  client_email: '',
  client_telephone: '',
  assigne_id: '',
    date_limite_resolution: ''

});
watch(
  () => form.value.assigne_id,
  (nouveau) => {
    if (!nouveau) {
      form.value.date_limite_resolution = '';
    }
  }
);
const normaliserTelephone = (tel) => {
  return tel
    .replace(/\s/g, '')
    .replace(/^\+221/, '')
    .replace(/^00221/, '');
};

function validerEmailClient() {
  if (!form.value.client_email) { emailClientInvalide.value = false; return }
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  emailClientInvalide.value = !re.test(form.value.client_email)
}

const soumettre = async () => {
  erreur.value = '';
  if (
  form.value.date_limite_resolution &&
  !form.value.assigne_id
) {
  erreur.value =
    "Vous devez assigner un technicien avant de définir une date limite de résolution.";
  return;
}

  if (!form.value.titre || !form.value.client_nom || !form.value.client_telephone) {
    erreur.value = 'Tous les champs marqués * sont obligatoires';
    return;
  }

 const tel = normaliserTelephone(form.value.client_telephone);

const phoneRegex = /^(77|76|78|70|75)[0-9]{7}$/;

if (!phoneRegex.test(tel)) {
  erreur.value = 'Numéro invalide (ex: 771234567 ou +221771234567)';
  return;
}

  if (form.value.client_email) {
    validerEmailClient();
    if (emailClientInvalide.value) { erreur.value = 'Email client invalide'; return; }
  }

  chargement.value = true;
  try {
    const data = {
      ...form.value,
      client_telephone: tel,
      client_email: form.value.client_email || null,
      assigne_id: form.value.assigne_id || null,
      date_limite_resolution: form.value.date_limite_resolution || null
    };
    await store.creerTicket(data);
    router.push('/kanban');
  } catch (e) {
    erreur.value = 'Erreur lors de la création du ticket';
  } finally {
    chargement.value = false;
  }
};

const annuler = () => router.push('/kanban');

onMounted(async () => {
  chargementTechs.value = true;
  try {
    const res = await api.get('/users?role=technicien');
    techniciens.value = res.data.data;
  } catch (e) {
    console.error('Erreur chargement techniciens', e);
  } finally {
    chargementTechs.value = false;
  }
});
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

.entete-form { margin-bottom: 24px; }

.eyebrow {
  font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.07em;
  color: var(--accent);
}

.entete-form h2 { font-size: 21px; margin-top: 6px; }

.grille-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.optionnel {
  text-transform: none; font-weight: 400;
  color: #9aa1ad; letter-spacing: 0;
}

.input-erreur { border-color: var(--danger) !important; }
.hint-erreur  { font-size: 11px; color: var(--danger); margin-top: 2px; display: block; }
.hint-info    { font-size: 11px; color: var(--ink-soft); margin-top: 2px; display: block; }

.actions { display: flex; gap: 12px; margin-top: 6px; }
.actions .btn { flex: 1; }

@media (max-width: 480px) {
  .grille-2 { grid-template-columns: 1fr; }
}
input:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}
</style>