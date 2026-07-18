<template>
  <div class="cloche-wrapper" ref="wrapper">
    <button class="btn-cloche" @click="ouvert = !ouvert">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M15 17H9m3-14v1.5M12 3a7 7 0 017 7v3l1.5 2.5h-17L5 13v-3a7 7 0 017-7z"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
        />
      </svg>

      <span v-if="store.compteur > 0" class="badge">
        {{ store.compteur > 9 ? '9+' : store.compteur }}
      </span>
    </button>

    <transition name="dropdown">
      <div v-if="ouvert" class="dropdown">
        <div class="dropdown-header">
          <span>Notifications</span>

          <button
            v-if="store.nonLues.length > 0"
            @click="store.marquerToutesLues()"
            class="btn-tout-lire"
          >
            Tout marquer comme lu
          </button>
        </div>

        <div class="notif-liste">
          <div
            v-for="n in store.notifications"
            :key="n.id"
            :class="['notif-item', { 'non-lue': !n.lue }]"
            @click="ouvrirNotification(n)"
          >
            <div class="notif-corps">
              <span class="notif-ref">{{ n.reference }}</span>

              <span class="notif-texte">
                {{ formatNotification(n) }}
              </span>

              <span class="notif-auteur">
                par {{ n.modifie_par || n.auteur }}
              </span>
            </div>

            <div class="notif-date">
              {{ formaterDate(n.date) }}
            </div>
          </div>

          <div v-if="store.notifications.length === 0" class="notif-vide">
            Aucune notification
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationsStore } from '../stores/notifications';

const store = useNotificationsStore();
const router = useRouter();

const ouvert = ref(false);
const wrapper = ref(null);

function formaterDate(iso) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 🔥 FORMAT INTELLIGENT
function formatNotification(n) {
  if (n.type === 'statut_change') {
    if (n.ancien_statut && n.nouveau_statut) {
      return `Statut modifié : ${n.ancien_statut} → ${n.nouveau_statut}`;
    }
    return n.message || 'Statut modifié';
  }

  if (n.type === 'nouveau_commentaire' || n.type === 'commentaire') {
    return `💬 Nouveau commentaire`;
  }

  if (n.type === 'nouvelle_piece_jointe' || n.type === 'piece_jointe') {
    return n.nom_fichier ? `📎 Fichier ajouté : ${n.nom_fichier}` : (n.message || `📎 Nouvelle pièce jointe`);
  }

  if (n.type === 'assignation') {
    return `🎫 Ticket assigné : ${n.reference || n.titre || ''}`.trim();
  }

  return n.message || 'Nouvelle notification';
}

// 🔥 CLICK → REDIRECTION + MARQUER LU
function ouvrirNotification(n) {
  store.marquerLue(n.id);

  if (n.ticket_id) {
    router.push(`/tickets/${n.ticket_id}`);
  }

  ouvert.value = false;
}

function onClickDehors(e) {
  if (wrapper.value && !wrapper.value.contains(e.target)) {
    ouvert.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', onClickDehors);
});

onUnmounted(() => {
  document.removeEventListener('click', onClickDehors);
});
</script>

<style scoped>
.cloche-wrapper {
  position: relative;
}

.btn-cloche {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  color: #c4cbda;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
}

.btn-cloche:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #dc2626;
  color: white;
  font-size: 9px;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 320px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 100;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

.btn-tout-lire {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 11px;
  color: #2563eb;
}

.notif-liste {
  max-height: 320px;
  overflow-y: auto;
}

.notif-item {
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid #f8fafc;
  transition: background 0.1s;
}

.notif-item:hover {
  background: #f8fafc;
}

.notif-item.non-lue {
  background: #eff6ff;
  border-left: 3px solid #2563eb;
}

.notif-corps {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.notif-ref {
  font-size: 11px;
  font-weight: 700;
  color: #1e40af;
  font-family: monospace;
}

.notif-texte {
  font-size: 12px;
  color: #374151;
}

.notif-auteur {
  font-size: 11px;
  color: #64748b;
}

.notif-date {
  font-size: 10px;
  color: #94a3b8;
  margin-top: 3px;
}

.notif-vide {
  padding: 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 12px;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>