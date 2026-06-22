<template>
  <div class="fil-commentaires">
    <h3>Commentaires <span class="compte mono">{{ commentaires.length }}</span></h3>

    <div class="liste">
      <div v-for="c in commentaires" :key="c.id" class="commentaire">
        <div class="commentaire-header">
          <span class="avatar">{{ initiale(c.auteur?.nom) }}</span>
          <span class="auteur">{{ c.auteur?.nom }}</span>
          <span class="role-badge">{{ c.auteur?.role }}</span>
          <span class="date mono">{{ formatDate(c.cree_le) }}</span>
        </div>

        <p class="contenu">{{ c.contenu }}</p>
      </div>

      <p v-if="commentaires.length === 0" class="vide">
        Aucun commentaire pour le moment
      </p>
    </div>

    <div class="nouveau-commentaire">
      <textarea
        v-model="texte"
        placeholder="Écrire un commentaire..."
        rows="3"
      />

      <div class="nouveau-actions">
        <button class="btn btn-primary" @click="envoyer" :disabled="!texte.trim() || envoi">
          {{ envoi ? 'Envoi...' : 'Envoyer' }}
        </button>
      </div>
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

function initiale(nom) {
  return nom ? nom.trim().charAt(0).toUpperCase() : '?';
}

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
.fil-commentaires h3 {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.compte {
  font-size: 11px;
  color: var(--ink-soft);
  background: var(--bg);
  border-radius: 99px;
  padding: 1px 7px;
}

.commentaire {
  background: var(--bg);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  margin-bottom: 8px;
}

.commentaire-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 12px;
}

.avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--navy-soft);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
}

.auteur {
  font-weight: 600;
}

.role-badge {
  background: var(--accent-soft);
  color: var(--accent);
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.date {
  color: #9aa1ad;
  margin-left: auto;
  font-size: 11px;
}

.contenu {
  font-size: 13.5px;
  color: var(--ink);
  margin: 0;
  line-height: 1.5;
}

.vide {
  text-align: center;
  font-size: 12.5px;
  color: #9aa1ad;
  padding: 18px 0;
}

.nouveau-commentaire {
  margin-top: 14px;
}

.nouveau-commentaire textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border);
  font-family: var(--font-body);
  font-size: 13.5px;
  resize: vertical;
}

.nouveau-commentaire textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.nouveau-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>