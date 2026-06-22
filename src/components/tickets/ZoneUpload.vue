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

        <a
          :href="urlComplete(p.url)"
          target="_blank"
          class="nom"
        >
          {{ p.nom_fichier }}
        </a>

        <span class="taille">
          {{ p.taille_ko }} Ko
        </span>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ticketService } from '../../services/ticketService';

const props = defineProps({
  ticketId: String
});

const pieces = ref([]);
const enSurvol = ref(false);
const enCours = ref(false);
const erreur = ref('');
const inputFile = ref(null);

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

  // Validation côté client avant l'envoi
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

function urlComplete(url) {
  return `${import.meta.env.VITE_API_URL}${url}`;
}

onMounted(charger);
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
  padding: 6px;
  background: #f8fafc;
  border-radius: 6px;
  margin-bottom: 4px;
}

.piece .nom {
  color: #2563eb;
  text-decoration: none;
  flex: 1;
}

.erreur {
  color: #dc2626;
  font-size: 12px;
  margin-top: 8px;
}
</style>