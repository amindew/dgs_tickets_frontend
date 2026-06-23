<template>
  <nav class="navbar">
    <div class="brand">
      <span class="pulse" aria-hidden="true"></span>
      <span class="logo">DGS<span class="logo-light">STICK</span></span>

      <button
        v-if="route.path === '/kanban'"
        class="btn-filtre-icone"
        :class="{ actif: filtresOuverts }"
        @click="$emit('toggleFiltres')"
        title="Filtres"
        aria-label="Ouvrir les filtres"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path
            d="M2 3h12l-4.5 5v4l-3-1.5V8L2 3z"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linejoin="round"
            fill="none"
          />
        </svg>
        <span class="filtre-label">Filtres</span>
        <span v-if="filtresActifs" class="filtre-dot" aria-hidden="true"></span>
      </button>

      <!-- Bouton Utilisateurs — admin seulement -->
      <router-link
        v-if="authStore.estAdmin"
        to="/admin/utilisateurs"
        class="lien-admin"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.4"/>
          <path d="M2 13c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
        Utilisateurs
      </router-link>

    </div>

    <div class="liens">
      <router-link to="/kanban">Tableau Kanban</router-link>

      <router-link
        v-if="authStore.estAdmin || authStore.estResponsable"
        to="/tickets/new"
        class="lien-nouveau"
      >
        + Nouveau ticket
      </router-link>
    </div>

    <div class="user-info">
        <ClocheNotifications />
     
      <button class="btn-deconnexion" @click="deconnecter">Déconnexion</button>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';
import { useRouter, useRoute } from 'vue-router';
import ClocheNotifications from './ClocheNotifications.vue';

const authStore = useAuthStore();
const router    = useRouter();
const route     = useRoute();

defineProps({
  filtresOuverts: { type: Boolean, default: false },
  filtresActifs:  { type: Boolean, default: false },
});

defineEmits(['toggleFiltres']);

function deconnecter() {
  authStore.seDeconnecter();
  router.push('/login');
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 28px;
  height: 60px;
  background: var(--navy);
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 20;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pulse {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse 2.2s infinite;
}

@keyframes pulse {
  0%   { box-shadow: 0 0 0 0   rgba(255,107,53,0.55); }
  70%  { box-shadow: 0 0 0 7px rgba(255,107,53,0);    }
  100% { box-shadow: 0 0 0 0   rgba(255,107,53,0);    }
}

@media (prefers-reduced-motion: reduce) { .pulse { animation: none; } }

.logo {
  font-weight: 700;
  font-size: 17px;
  letter-spacing: -0.01em;
}
.logo-light {
  color: #aab4c8;
  font-weight: 500;
  margin-left: 3px;
}

.btn-filtre-icone {
  position: relative;
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.14);
  color: #c4cbda;
  padding: 5px 11px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-filtre-icone:hover {
  background: rgba(255,255,255,0.13);
  color: #fff;
}
.btn-filtre-icone.actif {
  background: rgba(37,99,235,0.35);
  border-color: #3b82f6;
  color: #93c5fd;
}
.filtre-dot {
  position: absolute;
  top: 3px; right: 3px;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--accent);
}

.liens {
  display: flex;
  align-items: center;
  gap: 22px;
}
.liens a {
  color: #c4cbda;
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 500;
  padding: 8px 0;
  position: relative;
}
.liens a:hover { color: #fff; }
.liens a.router-link-active { color: #fff; }
.liens a.router-link-active::after {
  content: '';
  position: absolute;
  left: 0; right: 0; bottom: -2px;
  height: 2px;
  background: var(--accent);
  border-radius: 2px;
}

/* Bouton Utilisateurs */
.lien-admin {
  display: flex !important;
  align-items: center;
  gap: 5px;
  background: rgba(255,255,255,0.07) !important;
  border: 1px solid rgba(255,255,255,0.14);
  padding: 6px 12px !important;
  border-radius: 7px;
  font-size: 12.5px !important;
  transition: background 0.15s;
}
.lien-admin:hover {
  background: rgba(255,255,255,0.14) !important;
  color: #fff !important;
}
.lien-admin.router-link-active {
  background: rgba(37,99,235,0.3) !important;
  border-color: #3b82f6;
  color: #93c5fd !important;
}
.lien-admin.router-link-active::after { display: none; }

.lien-nouveau {
  background: var(--accent);
  color: #fff !important;
  padding: 7px 14px !important;
  border-radius: 7px;
}
.lien-nouveau::after  { display: none; }
.lien-nouveau:hover   { background: #f0571f; }

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-name { color: white; font-size: 13px; font-weight: 600; }
.user-role {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(255,255,255,0.1);
  color: #c4cbda;
  padding: 3px 7px;
  border-radius: 99px;
}
.btn-deconnexion {
  background: transparent;
  color: #c4cbda;
  border: 1px solid rgba(255,255,255,0.18);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12.5px;
  cursor: pointer;
  margin-left: 6px;
  transition: all 0.15s ease;
}
.btn-deconnexion:hover {
  background: var(--danger);
  border-color: var(--danger);
  color: #fff;
}
</style>