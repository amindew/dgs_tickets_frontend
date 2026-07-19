<template>
  <div class="fil-commentaires">
    <h3>Commentaires <span class="compte">{{ commentaires.length }}</span></h3>

    <!-- Liste des commentaires -->
    <div class="liste" ref="listeRef">
      <p v-if="commentaires.length === 0" class="vide">Aucun commentaire pour le moment</p>

      <div
        v-for="c in commentaires"
        :key="c.id"
        class="bulle-wrapper"
        :class="{ propre: c.auteur_id === authStore.user?.id }"
      >
        <div class="bulle" :class="{ 'bulle-propre': c.auteur_id === authStore.user?.id }">

          <template v-if="c.supprime">
            <p class="contenu-supprime">
              🚫 Commentaire supprimé par {{ c.suppresseur?.nom || 'un utilisateur' }}
            </p>
          </template>

          <template v-else>
            <!-- Réponse citée -->
            <div v-if="c.reponse_a" class="cite">
              <span class="cite-auteur">{{ c.reponse_a.auteur?.nom }}</span>
              <span class="cite-texte">{{ c.reponse_a.contenu }}</span>
            </div>

            <div class="bulle-header">
              <div class="avatar-mini" :style="{ background: couleurUtilisateur(c.auteur?.id) }">
                <img v-if="c.auteur?.photo_url" :src="urlPhoto(c.auteur.photo_url)" class="avatar-img" />
                <span v-else>{{ initiales(c.auteur?.nom) }}</span>
              </div>
              <span class="auteur">{{ c.auteur?.nom }}</span>
              <span class="role-badge" :class="c.auteur?.role">{{ c.auteur?.role }}</span>
              <span class="date">{{ formatDate(c.cree_le) }}</span>
            </div>

            <p class="contenu">{{ c.contenu }}</p>

            <!-- Actions -->
            <div class="bulle-actions">
              <button class="btn-action-inline" @click="repondreA(c)">
                ↩ Répondre
              </button>
              <button
                v-if="c.auteur_id === authStore.user?.id || authStore.estAdmin"
                class="btn-action-inline rouge"
                @click="confirmerSuppression(c)"
              >
                Supprimer
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Zone de réponse -->
    <div v-if="reponseA" class="bandeau-reponse">
      <div class="reponse-info">
        <span>↩ Répondre à <strong>{{ reponseA.auteur?.nom }}</strong></span>
        <span class="reponse-extrait">{{ reponseA.contenu.slice(0, 60) }}{{ reponseA.contenu.length > 60 ? '...' : '' }}</span>
      </div>
      <button class="btn-annuler-reponse" @click="reponseA = null">×</button>
    </div>

    <!-- Zone de saisie -->
    <div class="saisie">
      <div class="saisie-inner">
        <div class="avatar-mini moi" :style="{ background: couleurUtilisateur(authStore.user?.id) }">
          <img v-if="authStore.user?.photo_url" :src="urlPhoto(authStore.user.photo_url)" class="avatar-img" />
          <span v-else>{{ initiales(authStore.user?.nom) }}</span>
        </div>
        <textarea
          ref="textareaRef"
          v-model="texte"
          placeholder="Écrire un commentaire..."
          rows="1"
          @keydown.enter.exact.prevent="envoyer"
          @input="ajusterHauteur"
        />
        <button class="btn-envoyer" @click="envoyer" :disabled="!texte.trim() || envoi">
          <svg v-if="!envoi" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span v-else class="spinner"></span>
        </button>
      </div>
      <p class="aide-clavier">Entrée pour envoyer · Shift+Entrée pour saut de ligne</p>
    </div>

    <!-- Modal confirmation suppression -->
    <transition name="modal">
      <div v-if="commentaireASupprimmer" class="modal-overlay" @click.self="commentaireASupprimmer = null">
        <div class="modal-confirm">
          <p>Supprimer ce commentaire ?</p>
          <p class="modal-extrait">"{{ commentaireASupprimmer.contenu.slice(0, 80) }}"</p>
          <div class="modal-actions">
            <button class="btn-annuler" @click="commentaireASupprimmer = null">Annuler</button>
            <button class="btn-supprimer" @click="supprimer">Supprimer</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useAuthStore } from '../../stores/auth';
import api, { urlPhoto } from '../../services/api';
import { couleurUtilisateur, initiales } from '../../utils/avatar';

const props = defineProps({ ticketId: String });
const authStore = useAuthStore();

const commentaires         = ref([]);
const texte                = ref('');
const envoi                = ref(false);
const reponseA             = ref(null);
const commentaireASupprimmer = ref(null);
const listeRef             = ref(null);
const textareaRef          = ref(null);

function formatDate(date) {
  return new Date(date).toLocaleString('fr-FR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });
}

async function charger() {
  try {
    const res = await api.get(`/tickets/${props.ticketId}/commentaires`);
    commentaires.value = res.data.data;
    await nextTick();
    scrollerEnBas();
  } catch (e) {
    console.error('Erreur chargement commentaires', e);
  }
}

function scrollerEnBas() {
  if (listeRef.value) {
    listeRef.value.scrollTop = listeRef.value.scrollHeight;
  }
}

function ajusterHauteur() {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function repondreA(commentaire) {
  reponseA.value = commentaire;
  textareaRef.value?.focus();
}

function confirmerSuppression(commentaire) {
  commentaireASupprimmer.value = commentaire;
}

async function supprimer() {
  if (!commentaireASupprimmer.value) return;
  try {
    await api.delete(`/tickets/${props.ticketId}/commentaires/${commentaireASupprimmer.value.id}`);
    // Suppression douce : le commentaire reste dans la liste, affiche a la
    // place comme "supprime par X"
    const cible = commentaires.value.find(c => c.id === commentaireASupprimmer.value.id);
    if (cible) {
      cible.supprime = true;
      cible.suppresseur = { nom: authStore.user?.nom };
    }
    commentaireASupprimmer.value = null;
  } catch (e) {
    alert('Erreur lors de la suppression');
  }
}

async function envoyer() {
  if (!texte.value.trim() || envoi.value) return;
  envoi.value = true;

  try {
    const body = { contenu: texte.value.trim() };
    if (reponseA.value) body.reponse_a_id = reponseA.value.id;

    const res = await api.post(`/tickets/${props.ticketId}/commentaires`, body);

    // Si l'auteur est aussi le createur/assigne du ticket, l'echo temps reel
    // (evenement "nouveauCommentaire") peut arriver avant la reponse de cet
    // appel : on evite de l'ajouter une seconde fois.
    if (!commentaires.value.find(c => c.id === res.data.data.id)) {
      commentaires.value.push(res.data.data);
    }
    texte.value = '';
    reponseA.value = null;

    await nextTick();
    scrollerEnBas();
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto';
    }
  } catch (e) {
    alert('Erreur lors de l\'envoi');
  } finally {
    envoi.value = false;
  }
}

function onNouveauCommentaire(event) {
  const data = event.detail;
  if (data?.ticket_id === props.ticketId) {
    const existe = commentaires.value.find(c => c.id === data.commentaire?.id);
    if (!existe && data.commentaire) {
      commentaires.value.push(data.commentaire);
      nextTick().then(scrollerEnBas);
    }
  }
}

onMounted(() => {
  charger();
  window.addEventListener('nouveauCommentaire', onNouveauCommentaire);
});

onUnmounted(() => {
  window.removeEventListener('nouveauCommentaire', onNouveauCommentaire);
});
</script>

<style scoped>
.fil-commentaires {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.fil-commentaires h3 {
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: var(--ink);
}

.compte {
  font-size: 11px; color: var(--ink-soft);
  background: var(--bg); border-radius: 99px; padding: 1px 7px;
}

/* Liste scrollable */
.liste {
  max-height: 420px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 8px;
  scroll-behavior: smooth;
}

.vide {
  text-align: center; font-size: 13px;
  color: var(--ink-soft); padding: 24px 0;
}

/* Bulles style chat */
.bulle-wrapper {
  display: flex;
  justify-content: flex-start;
}
.bulle-wrapper.propre {
  justify-content: flex-end;
}

.bulle {
  max-width: 80%;
  background: var(--bg);
  border-radius: 12px 12px 12px 0;
  padding: 10px 12px;
  border: 1px solid var(--border);
}

.bulle-propre {
  background: #eff6ff;
  border-color: #bfdbfe;
  border-radius: 12px 12px 0 12px;
}

/* Réponse citée */
.cite {
  background: rgba(0,0,0,0.05);
  border-left: 3px solid var(--accent);
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cite-auteur { font-size: 11px; font-weight: 600; color: var(--accent); }
.cite-texte  { font-size: 11px; color: var(--ink-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Header bulle */
.bulle-header {
  display: flex; align-items: center; gap: 6px;
  margin-bottom: 5px; flex-wrap: wrap;
}

.avatar-mini {
  width: 18px; height: 18px; border-radius: 50%;
  color: white; font-size: 9px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden;
}
.avatar-mini.moi { width: 28px; height: 28px; font-size: 12px; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }

.auteur { font-size: 12px; font-weight: 600; color: var(--ink); }
.date   { font-size: 10px; color: var(--ink-soft); margin-left: auto; }

.role-badge {
  font-size: 9px; font-weight: 700; text-transform: uppercase;
  padding: 1px 5px; border-radius: 3px; letter-spacing: 0.04em;
}
.role-badge.admin        { background: #fee2e2; color: #dc2626; }
.role-badge.responsable  { background: #fef3c7; color: #a16207; }
.role-badge.technicien   { background: #dbeafe; color: #1d4ed8; }

.contenu {
  font-size: 13px; color: var(--ink); margin: 0;
  line-height: 1.5; word-break: break-word;
}

.contenu-supprime {
  font-size: 12px; color: var(--ink-soft); margin: 0;
  font-style: italic;
}

/* Actions sur bulle */
.bulle-actions {
  display: flex; gap: 8px; margin-top: 6px;
}
.btn-action-inline {
  font-size: 11px; color: var(--ink-soft); background: none;
  border: none; cursor: pointer; padding: 0;
}
.btn-action-inline:hover { color: var(--ink); }
.btn-action-inline.rouge:hover { color: var(--danger); }

/* Bandeau réponse */
.bandeau-reponse {
  display: flex; align-items: center; justify-content: space-between;
  background: #eff6ff; border: 1px solid #bfdbfe;
  border-bottom: none; border-radius: 8px 8px 0 0;
  padding: 8px 12px; gap: 10px;
}
.reponse-info { display: flex; flex-direction: column; gap: 2px; font-size: 12px; }
.reponse-info strong { color: var(--accent); }
.reponse-extrait { color: var(--ink-soft); font-size: 11px; }
.btn-annuler-reponse {
  background: none; border: none; cursor: pointer;
  color: var(--ink-soft); font-size: 18px; line-height: 1; padding: 0; flex-shrink: 0;
}

/* Zone de saisie */
.saisie {
  margin-top: 10px;
  border-top: 1px solid var(--border);
  padding-top: 12px;
}
.saisie-inner {
  display: flex; align-items: flex-end; gap: 8px;
}
.saisie-inner textarea {
  flex: 1; padding: 9px 12px;
  border-radius: 20px; border: 1.5px solid var(--border);
  font-family: var(--font-body); font-size: 13px;
  resize: none; min-height: 38px; max-height: 120px;
  transition: border-color 0.15s;
  line-height: 1.4;
}
.saisie-inner textarea:focus {
  outline: none; border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.btn-envoyer {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--accent); color: white; border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; transition: background 0.15s;
}
.btn-envoyer:hover:not(:disabled) { background: #f0571f; }
.btn-envoyer:disabled { opacity: 0.5; cursor: not-allowed; }

.spinner {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.aide-clavier {
  font-size: 10px; color: var(--ink-soft);
  margin: 4px 0 0 46px;
}

/* Modal confirmation suppression */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(15,23,42,0.4);
  z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-confirm {
  background: white; border-radius: 12px; padding: 20px;
  max-width: 340px; width: 100%; box-shadow: 0 20px 50px rgba(0,0,0,0.2);
}
.modal-confirm p { font-size: 14px; font-weight: 600; color: var(--ink); margin-bottom: 8px; }
.modal-extrait { font-size: 12px !important; color: var(--ink-soft) !important; font-weight: 400 !important; font-style: italic; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
.btn-annuler {
  background: none; border: 1px solid var(--border); border-radius: 8px;
  padding: 8px 14px; font-size: 13px; cursor: pointer; color: var(--ink-soft);
}
.btn-supprimer {
  background: var(--danger); color: white; border: none;
  border-radius: 8px; padding: 8px 14px; font-size: 13px;
  font-weight: 600; cursor: pointer;
}

.modal-enter-active, .modal-leave-active { transition: all 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

/* Mobile */
@media (max-width: 1024px) {
  .bulle { max-width: 90%; }
  .aide-clavier { margin-left: 38px; }
}
</style>