<template>
  <div class="fil-commentaires">
    <h3>
      Commentaires ({{ commentaires.length }})
    </h3>

    <div class="liste">
      <div
        v-for="c in commentaires"
        :key="c.id"
        class="commentaire"
      >
        <div class="commentaire-header">
          <span class="auteur">
            {{ c.auteur?.nom }}
          </span>

          <span class="role-badge">
            {{ c.auteur?.role }}
          </span>

          <span class="date">
            {{ formatDate(c.cree_le) }}
          </span>
        </div>

        <p class="contenu">
          {{ c.contenu }}
        </p>
      </div>

      <p
        v-if="commentaires.length === 0"
        class="vide"
      >
        Aucun commentaire pour le moment
      </p>
    </div>

    <div class="nouveau-commentaire">
      <textarea
        v-model="texte"
        placeholder="Ecrire un commentaire..."
        rows="3"
      />

      <button
        @click="envoyer"
        :disabled="!texte.trim() || envoi"
      >
        {{ envoi ? 'Envoi...' : 'Envoyer' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ticketService } from '../../services/ticketService';

const props = defineProps({
  ticketId: String,
});

const commentaires = ref([]);
const texte = ref('');
const envoi = ref(false);

async function charger() {
  commentaires.value = await ticketService.getCommentaires(
    props.ticketId
  );
}

async function envoyer() {
  if (!texte.value.trim()) return;

  envoi.value = true;

  try {
    await ticketService.ajouterCommentaire(
      props.ticketId,
      texte.value
    );

    texte.value = '';

    // Recharger le fil
    await charger();
  } catch (e) {
    alert('Erreur lors de l envoi du commentaire');
  } finally {
    envoi.value = false;
  }
}

function formatDate(date) {
  return new Date(date).toLocaleString('fr-FR');
}

onMounted(charger);
</script>

<style scoped>
.commentaire {
  background: #f8fafc;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 8px;
}

.commentaire-header {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
  font-size: 12px;
}

.auteur {
  font-weight: bold;
}

.role-badge {
  background: #dbeafe;
  color: #1e40af;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
}

.date {
  color: #64748b;
  margin-left: auto;
}

.nouveau-commentaire {
  margin-top: 12px;
}

.nouveau-commentaire textarea {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}
</style>