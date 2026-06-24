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
          <path d="M2 3h12l-4.5 5v4l-3-1.5V8L2 3z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" fill="none"/>
        </svg>
        <span class="filtre-label">Filtres</span>
        <span v-if="filtresActifs" class="filtre-dot" aria-hidden="true"></span>
      </button>

      <router-link v-if="authStore.estAdmin" to="/admin/utilisateurs" class="lien-admin">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.4"/>
          <path d="M2 13c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
        <span class="lien-label">Utilisateurs</span>
      </router-link>
    </div>

    <div class="liens">
  <router-link to="/kanban">
    Tableau Kanban
  </router-link>

  <router-link
    v-if="authStore.estAdmin || authStore.estResponsable"
    to="/tickets/new"
    class="lien-nouveau"
  >
    + Nouveau ticket
  </router-link>

  <router-link
    v-if="authStore.estAdmin || authStore.estResponsable"
    to="/dashboard"
  >
    Tableau de bord
  </router-link>
</div>

    <div class="user-info">
      <ClocheNotifications />
      <span class="user-name desktop-only">{{ authStore.user?.nom }}</span>
      <span class="user-role desktop-only">{{ authStore.user?.role }}</span>

      <!-- Menu burger mobile -->
      <button class="btn-burger mobile-only" @click="menuOuvert = !menuOuvert" aria-label="Menu">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>

      <button class="btn-deconnexion desktop-only" @click="deconnecter">Déconnexion</button>
    </div>

    <!-- Dropdown mobile -->
    <transition name="menu-slide">
      <div v-if="menuOuvert" class="menu-mobile">
        <div class="menu-user">
          <span class="menu-nom">{{ authStore.user?.nom }}</span>
          <span class="menu-role">{{ authStore.user?.role }}</span>
        </div>
        <router-link to="/kanban" @click="menuOuvert = false">Tableau Kanban</router-link>
        <router-link
          v-if="authStore.estAdmin || authStore.estResponsable"
          to="/tickets/new"
          @click="menuOuvert = false"
        >
          + Nouveau ticket
        </router-link>
        <button class="menu-deconnexion" @click="deconnecter">Déconnexion</button>
      </div>
    </transition>
  </nav>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter, useRoute } from 'vue-router';
import ClocheNotifications from './ClocheNotifications.vue';

const authStore    = useAuthStore();
const router       = useRouter();
const route        = useRoute();
const menuOuvert   = ref(false);

defineProps({
  filtresOuverts: { type: Boolean, default: false },
  filtresActifs:  { type: Boolean, default: false },
});

defineEmits(['toggleFiltres']);

function deconnecter() {
  menuOuvert.value = false;
  authStore.seDeconnecter();
  router.push('/login');
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background: var(--navy);
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 50;
  flex-wrap: wrap;
}

.brand { display: flex; align-items: center; gap: 10px; }

.pulse {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--accent); animation: pulse 2.2s infinite; flex-shrink: 0;
}
@keyframes pulse {
  0%   { box-shadow: 0 0 0 0   rgba(255,107,53,0.55); }
  70%  { box-shadow: 0 0 0 7px rgba(255,107,53,0);    }
  100% { box-shadow: 0 0 0 0   rgba(255,107,53,0);    }
}
@media (prefers-reduced-motion: reduce) { .pulse { animation: none; } }

.logo { font-weight: 700; font-size: 17px; letter-spacing: -0.01em; white-space: nowrap; }
.logo-light { color: #aab4c8; font-weight: 500; margin-left: 3px; }

.btn-filtre-icone {
  position: relative; display: flex; align-items: center; gap: 5px;
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.14);
  color: #c4cbda; padding: 5px 11px; border-radius: 7px;
  font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s ease;
}
.btn-filtre-icone:hover { background: rgba(255,255,255,0.13); color: #fff; }
.btn-filtre-icone.actif { background: rgba(37,99,235,0.35); border-color: #3b82f6; color: #93c5fd; }
.filtre-dot {
  position: absolute; top: 3px; right: 3px;
  width: 6px; height: 6px; border-radius: 50%; background: var(--accent);
}

.lien-admin {
  display: flex !important; align-items: center; gap: 5px;
  background: rgba(255,255,255,0.07) !important; border: 1px solid rgba(255,255,255,0.14);
  padding: 6px 12px !important; border-radius: 7px; font-size: 12.5px !important;
  color: #c4cbda; text-decoration: none; transition: background 0.15s;
}
.lien-admin:hover { background: rgba(255,255,255,0.14) !important; color: #fff !important; }
.lien-admin.router-link-active { background: rgba(37,99,235,0.3) !important; border-color: #3b82f6; color: #93c5fd !important; }

.liens { display: flex; align-items: center; gap: 22px; }
.liens a {
  color: #c4cbda; text-decoration: none; font-size: 13.5px;
  font-weight: 500; padding: 8px 0; position: relative;
}
.liens a:hover { color: #fff; }
.liens a.router-link-active { color: #fff; }
.liens a.router-link-active::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: -2px;
  height: 2px; background: var(--accent); border-radius: 2px;
}
.lien-nouveau {
  background: var(--accent); color: #fff !important;
  padding: 7px 14px !important; border-radius: 7px;
}
.lien-nouveau::after { display: none; }
.lien-nouveau:hover { background: #f0571f; }

.user-info { display: flex; align-items: center; gap: 8px; }
.user-name { color: white; font-size: 13px; font-weight: 600; }
.user-role {
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em;
  background: rgba(255,255,255,0.1); color: #c4cbda; padding: 3px 7px; border-radius: 99px;
}
.btn-deconnexion {
  background: transparent; color: #c4cbda;
  border: 1px solid rgba(255,255,255,0.18); padding: 6px 12px;
  border-radius: 6px; font-size: 12.5px; cursor: pointer;
  transition: all 0.15s ease;
}
.btn-deconnexion:hover { background: var(--danger); border-color: var(--danger); color: #fff; }

/* Burger */
.btn-burger {
  background: none; border: none; cursor: pointer;
  color: #c4cbda; display: flex; align-items: center; padding: 4px;
}
.btn-burger:hover { color: white; }

/* Menu mobile dropdown */
.menu-mobile {
  position: absolute; top: 60px; left: 0; right: 0;
  background: var(--navy); border-top: 1px solid rgba(255,255,255,0.1);
  display: flex; flex-direction: column; z-index: 49;
  padding: 8px 0 16px;
}
.menu-mobile a, .menu-mobile button {
  display: block; padding: 12px 20px; color: #c4cbda;
  text-decoration: none; font-size: 14px; font-weight: 500;
  background: none; border: none; text-align: left; cursor: pointer;
  transition: background 0.15s;
}
.menu-mobile a:hover, .menu-mobile button:hover { background: rgba(255,255,255,0.07); color: white; }
.menu-mobile a.router-link-active { color: white; }
.menu-user {
  display: flex; flex-direction: column; padding: 12px 20px 8px;
  border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 4px;
}
.menu-nom { font-size: 14px; font-weight: 600; color: white; }
.menu-role {
  font-size: 11px; color: #94a3b8; text-transform: uppercase;
  letter-spacing: 0.05em; margin-top: 2px;
}
.menu-deconnexion { color: var(--danger) !important; }

.menu-slide-enter-active, .menu-slide-leave-active { transition: all 0.2s ease; }
.menu-slide-enter-from, .menu-slide-leave-to { opacity: 0; transform: translateY(-8px); }

/* Responsive */
.desktop-only { display: flex; }
.mobile-only  { display: none; }

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only  { display: flex !important; }
  .filtre-label { display: none; }
  .lien-label   { display: none; }
  .navbar { position: relative; }
}
</style>