<template>
  <div class="zone-upload">
    <h3>Pièces jointes ({{ pieces.length }})</h3>

    <div class="liste-pieces">
      <div
        v-for="p in pieces"
        :key="p.id"
        class="piece"
      >
        <span class="icone">📄</span>

        <div class="piece-info">
          <a
            :href="urlComplete(p.url)"
            target="_blank"
            class="nom"
          >
            {{ p.nom_fichier }}
          </a>
          <span class="meta-upload">
            {{ p.uploadeur?.nom || 'Utilisateur inconnu' }} · {{ formaterDate(p.createdAt) }}
          </span>
        </div>

        <span class="taille">
          {{ p.taille_ko }} Ko
        </span>

        <button
          v-if="p.uploade_par === authStore.user?.id"
          class="btn-supprimer-piece"
          title="Supprimer cette pièce jointe"
          @click="demanderSuppression(p)"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <div
      class="depot"
      :class="{ survol: enSurvol }"
      @dragover.prevent="enSurvol = true"
      @dragleave.prevent="enSurvol = false"
      @drop.prevent="onDrop"
      @click="ouvrirSelecteur"
    >
      <p v-if="!enCours">
        Glissez un fichier ici ou cliquez pour parcourir
      </p>

      <p v-else>
        Upload en cours...
      </p>

      <p class="hint">
        PDF, DOCX, PNG, JPG — 10 Mo maximum
      </p>

      <input
        ref="inputFile"
        type="file"
        accept=".pdf,.docx,.png,.jpg,.jpeg"
        @change="onFileSelected"
        style="display: none"
      />
    </div>

    <p
      v-if="erreur"
      class="erreur"
    >
      {{ erreur }}
    </p>

    <!-- Modale confirmation suppression -->
    <transition name="modal">
      <div v-if="pieceASupprimer" class="modal-overlay" @click.self="pieceASupprimer = null">
        <div class="modal-confirm">
          <p>Supprimer cette pièce jointe ?</p>
          <p class="modal-extrait">"{{ pieceASupprimer.nom_fichier }}"</p>
          <div class="modal-actions">
            <button class="btn-annuler" @click="pieceASupprimer = null">Annuler</button>
            <button class="btn-supprimer" :disabled="suppressionEnCours" @click="confirmerSuppression">
              {{ suppressionEnCours ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { ticketService } from '../../services/ticketService';
import api, { urlPhoto } from '../../services/api';
import { useAuthStore } from '../../stores/auth';

const props = defineProps({
  ticketId: String
});

const authStore = useAuthStore();

const pieces = ref([]);
const enSurvol = ref(false);
const enCours = ref(false);
const erreur = ref('');
const inputFile = ref(null);

const pieceASupprimer = ref(null);
const suppressionEnCours = ref(false);

const TAILLE_MAX = 10 * 1024 * 1024;

const FORMATS = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg'
];

async function charger() {
  pieces.value = await ticketService.getPieces(props.ticketId);
}

function onNouvellePieceJointe(event) {
  const data = event.detail;
  if (data?.ticket_id === props.ticketId && data.piece) {
    const existe = pieces.value.find(p => p.id === data.piece.id);
    if (!existe) pieces.value.push(data.piece);
  }
}

function ouvrirSelecteur() {
  inputFile.value.click();
}

function onFileSelected(event) {
  const fichier = event.target.files[0];

  if (fichier) {
    envoyerFichier(fichier);
  }
}

function onDrop(event) {
  enSurvol.value = false;

  const fichier = event.dataTransfer.files[0];

  if (fichier) {
    envoyerFichier(fichier);
  }
}

async function envoyerFichier(fichier) {
  erreur.value = '';

  if (!FORMATS.includes(fichier.type)) {
    erreur.value =
      'Format non autorisé (PDF, DOCX, PNG, JPG uniquement)';
    return;
  }

  if (fichier.size > TAILLE_MAX) {
    erreur.value =
      'Fichier trop volumineux (max 10 Mo)';
    return;
  }

  enCours.value = true;

  try {
    await ticketService.uploaderFichier(
      props.ticketId,
      fichier
    );

    await charger();
  } catch (e) {
    erreur.value =
      e.response?.data?.message ||
      "Erreur lors de l'upload";
  } finally {
    enCours.value = false;
  }
}

function demanderSuppression(piece) {
  pieceASupprimer.value = piece;
}

async function confirmerSuppression() {
  if (!pieceASupprimer.value) return;
  suppressionEnCours.value = true;

  try {
    await api.delete(`/tickets/${props.ticketId}/pieces/${pieceASupprimer.value.id}`);
    pieces.value = pieces.value.filter(p => p.id !== pieceASupprimer.value.id);
    pieceASupprimer.value = null;
  } catch (e) {
    erreur.value = e.response?.data?.message || 'Erreur lors de la suppression';
  } finally {
    suppressionEnCours.value = false;
  }
}

function urlComplete(url) {
  return urlPhoto(url);
}

function formaterDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleString('fr-FR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });
}

onMounted(() => {
  charger();
  window.addEventListener('nouvellePieceJointe', onNouvellePieceJointe);
});

onUnmounted(() => {
  window.removeEventListener('nouvellePieceJointe', onNouvellePieceJointe);
});
</script>

<style scoped>
.depot {
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.depot.survol {
  border-color: #2563eb;
  background: #eff6ff;
}

.hint {
  font-size: 11px;
  color: #94a3b8;
}

.piece {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px 8px;
  background: #f8fafc;
  border-radius: 6px;
  margin-bottom: 4px;
}

.piece-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.piece .nom {
  color: #2563eb;
  text-decoration: none;
}

.meta-upload {
  font-size: 10px;
  color: #94a3b8;
}

.taille {
  font-size: 11px;
  color: #94a3b8;
  flex-shrink: 0;
}

.btn-supprimer-piece {
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: color 0.15s, background 0.15s;
}
.btn-supprimer-piece:hover {
  color: #dc2626;
  background: #fee2e2;
}

.erreur {
  color: #dc2626;
  font-size: 12px;
  margin-top: 8px;
}

/* Modale confirmation */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(15,23,42,0.4);
  z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-confirm {
  background: white; border-radius: 12px; padding: 20px;
  max-width: 340px; width: 100%; box-shadow: 0 20px 50px rgba(0,0,0,0.2);
}
.modal-confirm p { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 8px; }
.modal-extrait { font-size: 12px !important; color: #94a3b8 !important; font-weight: 400 !important; font-style: italic; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
.btn-annuler {
  background: none; border: 1px solid #e2e8f0; border-radius: 8px;
  padding: 8px 14px; font-size: 13px; cursor: pointer; color: #64748b;
}
.btn-supprimer {
  background: #dc2626; color: white; border: none;
  border-radius: 8px; padding: 8px 14px; font-size: 13px;
  font-weight: 600; cursor: pointer;
}
.btn-supprimer:disabled { opacity: 0.5; cursor: not-allowed; }

.modal-enter-active, .modal-leave-active { transition: all 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>