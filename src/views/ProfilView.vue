<template>
  <div class="profil-page">
    <div class="profil-container">
      <h1 class="profil-titre">Mon profil</h1>

      <!-- Section photo -->
      <div class="card-surface section">
        <h2 class="section-titre">Photo de profil</h2>

        <div class="photo-zone">
          <div class="avatar-preview" :style="{ backgroundColor: couleurUtilisateur(authStore.user?.id) }">
            <img v-if="apercuPhoto" :src="apercuPhoto" alt="Aperçu" />
            <img v-else-if="authStore.user?.photo_url" :src="urlPhoto(authStore.user.photo_url)" alt="Photo actuelle" />
            <span v-else class="avatar-initiales">{{ initiales(authStore.user?.nom) }}</span>
          </div>

          <div class="photo-actions">
            <label class="btn-choisir">
              Choisir une image
              <input type="file" accept="image/png, image/jpeg" @change="onFichierChoisi" hidden />
            </label>
            <button
              class="btn-envoyer"
              :disabled="!fichierChoisi || uploadEnCours"
              @click="envoyerPhoto"
            >
              {{ uploadEnCours ? 'Envoi...' : 'Enregistrer la photo' }}
            </button>
            <button
              v-if="authStore.user?.photo_url"
              class="btn-supprimer-photo"
              :disabled="suppressionEnCours"
              @click="supprimerPhoto"
            >
              {{ suppressionEnCours ? 'Suppression...' : 'Supprimer la photo' }}
            </button>
          </div>
        </div>

        <p v-if="erreurPhoto" class="message-erreur">{{ erreurPhoto }}</p>
        <p v-if="succesPhoto" class="message-succes">{{ succesPhoto }}</p>
      </div>

      <!-- Section mot de passe -->
      <div class="card-surface section">
        <h2 class="section-titre">Changer mon mot de passe</h2>

        <form @submit.prevent="changerMotDePasse" class="form-mdp">
          <label class="champ">
            <span>Mot de passe actuel</span>
            <input type="password" v-model="ancienMdp" required />
          </label>

          <label class="champ">
            <span>Nouveau mot de passe</span>
            <input type="password" v-model="nouveauMdp" required minlength="8" />
          </label>

          <label class="champ">
            <span>Confirmer le nouveau mot de passe</span>
            <input type="password" v-model="confirmationMdp" required minlength="8" />
          </label>

          <p v-if="erreurMdp" class="message-erreur">{{ erreurMdp }}</p>
          <p v-if="succesMdp" class="message-succes">{{ succesMdp }}</p>

          <button type="submit" class="btn-envoyer" :disabled="mdpEnCours">
            {{ mdpEnCours ? 'Mise à jour...' : 'Mettre à jour le mot de passe' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import api, { urlPhoto } from '../services/api';
import { couleurUtilisateur, initiales } from '../utils/avatar';

const authStore = useAuthStore();

// ── Photo ──────────────────────────────────────────────────────────────────
const fichierChoisi     = ref(null);
const apercuPhoto       = ref(null);
const uploadEnCours     = ref(false);
const suppressionEnCours = ref(false);
const erreurPhoto       = ref('');
const succesPhoto       = ref('');

function onFichierChoisi(e) {
  const fichier = e.target.files[0];
  if (!fichier) return;

  erreurPhoto.value = '';
  succesPhoto.value = '';
  fichierChoisi.value = fichier;
  apercuPhoto.value = URL.createObjectURL(fichier);
}

async function envoyerPhoto() {
  if (!fichierChoisi.value) return;
  uploadEnCours.value = true;
  erreurPhoto.value = '';
  succesPhoto.value = '';

  try {
    const formData = new FormData();
    formData.append('photo', fichierChoisi.value);

    const res = await api.post('/users/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    authStore.mettreAJourPhoto(res.data.data.photo_url);
    succesPhoto.value = 'Photo mise à jour avec succès';
    fichierChoisi.value = null;
    apercuPhoto.value = null;
  } catch (e) {
    erreurPhoto.value = e.response?.data?.message || "Erreur lors de l'envoi de la photo";
  } finally {
    uploadEnCours.value = false;
  }
}

async function supprimerPhoto() {
  suppressionEnCours.value = true;
  erreurPhoto.value = '';
  succesPhoto.value = '';

  try {
    await api.delete('/users/photo');
    authStore.mettreAJourPhoto(null);
    succesPhoto.value = 'Photo de profil supprimée';
  } catch (e) {
    erreurPhoto.value = e.response?.data?.message || 'Erreur lors de la suppression de la photo';
  } finally {
    suppressionEnCours.value = false;
  }
}

// ── Mot de passe ──────────────────────────────────────────────────────────
const ancienMdp        = ref('');
const nouveauMdp        = ref('');
const confirmationMdp   = ref('');
const mdpEnCours        = ref(false);
const erreurMdp         = ref('');
const succesMdp         = ref('');

async function changerMotDePasse() {
  erreurMdp.value = '';
  succesMdp.value = '';

  if (nouveauMdp.value !== confirmationMdp.value) {
    erreurMdp.value = 'Les deux mots de passe ne correspondent pas';
    return;
  }

  if (nouveauMdp.value.length < 8) {
    erreurMdp.value = 'Le nouveau mot de passe doit faire au moins 8 caractères';
    return;
  }

  mdpEnCours.value = true;
  try {
    await api.patch('/auth/mot-de-passe', {
      ancien_mot_de_passe: ancienMdp.value,
      nouveau_mot_de_passe: nouveauMdp.value,
    });

    succesMdp.value = 'Mot de passe mis à jour avec succès';
    ancienMdp.value = '';
    nouveauMdp.value = '';
    confirmationMdp.value = '';
  } catch (e) {
    erreurMdp.value = e.response?.data?.message || 'Erreur lors de la mise à jour du mot de passe';
  } finally {
    mdpEnCours.value = false;
  }
}
</script>

<style scoped>
.profil-page {
  padding: 24px 16px;
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  justify-content: center;
}

.profil-container {
  width: 100%;
  max-width: 520px;
}

.profil-titre {
  font-size: 20px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 20px;
}

.section {
  padding: 20px;
  border-radius: var(--radius-md);
  margin-bottom: 20px;
}

.section-titre {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 16px;
}

.photo-zone {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.avatar-preview {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initiales {
  color: white;
  font-size: 22px;
  font-weight: 700;
}

.photo-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-choisir {
  background: white;
  border: 1px solid var(--border);
  color: var(--ink);
  border-radius: 10px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  text-align: center;
}
.btn-choisir:hover { border-color: var(--border-strong); }

.btn-envoyer {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.btn-envoyer:hover:not(:disabled) { background: #ea580c; }
.btn-envoyer:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-supprimer-photo {
  background: none;
  border: 1px solid var(--danger);
  color: var(--danger);
  border-radius: 10px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.btn-supprimer-photo:hover:not(:disabled) { background: var(--danger-soft); }
.btn-supprimer-photo:disabled { opacity: 0.5; cursor: not-allowed; }

.form-mdp {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.champ {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
}

.champ input {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 13px;
  font-family: inherit;
}
.champ input:focus {
  outline: none;
  border-color: var(--accent);
}

.message-erreur {
  background: var(--danger-soft);
  color: var(--danger);
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
}

.message-succes {
  background: var(--success-soft);
  color: var(--success);
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
}
</style>