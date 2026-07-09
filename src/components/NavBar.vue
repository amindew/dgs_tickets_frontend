<template>
  <nav class="navbar">
    <!-- Ligne principale -->
    <div class="navbar-main">
      <div class="brand">
        <span class="pulse" aria-hidden="true"></span>
        <span class="logo">DGS<span class="logo-light">STICK</span></span>

        <button
          v-if="route.path === '/kanban'"
          class="btn-filtre-icone"
          :class="{ actif: filtresOuverts }"
          @click="$emit('toggleFiltres')"
          aria-label="Ouvrir les filtres"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 3h12l-4.5 5v4l-3-1.5V8L2 3z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" fill="none"/>
          </svg>
          <span class="filtre-label">Filtres</span>
          <span v-if="filtresActifs" class="filtre-dot"></span>
        </button>
      </div>

      <!-- Desktop centre -->
      <div class="liens desktop-only">
        <router-link to="/kanban">Kanban</router-link>
        <router-link to="/dashboard" v-if="authStore.estAdmin || authStore.estResponsable">Dashboard</router-link>
        <router-link v-if="authStore.estAdmin" to="/admin/utilisateurs" class="lien-admin">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.4"/>
            <path d="M2 13c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          Utilisateurs
        </router-link>
        <router-link
          v-if="authStore.estAdmin || authStore.estResponsable"
          to="/tickets/new"
          class="lien-nouveau"
        >
          + Nouveau ticket
        </router-link>
      </div>

      <!-- Droite -->
      <div class="navbar-right">
        <ClocheNotifications />
        <router-link to="/profil" class="user-mini desktop-only" title="Mon profil">
          <span
            v-if="authStore.user?.photo_url"
            class="avatar-nav"
            :style="{ backgroundImage: `url(${urlPhoto(authStore.user.photo_url)})` }"
          ></span>
          <span v-else class="avatar-nav avatar-nav-initiales">{{ initiales(authStore.user?.nom) }}</span>
          <span class="user-name">{{ authStore.user?.nom }}</span>
          <span class="user-role">{{ authStore.user?.role }}</span>
        </router-link>
        <button class="btn-deconnexion desktop-only" @click="deconnecter">Déconnexion</button>

        <!-- Burger mobile -->
        <button class="btn-burger mobile-only" @click="menuOuvert = !menuOuvert" aria-label="Menu">
          <svg v-if="!menuOuvert" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Menu mobile déroulant -->
    <transition name="menu-slide">
      <div v-if="menuOuvert" class="menu-mobile">
        <router-link to="/profil" class="menu-user" @click="menuOuvert = false">
          <span
            v-if="authStore.user?.photo_url"
            class="avatar-nav avatar-menu"
            :style="{ backgroundImage: `url(${urlPhoto(authStore.user.photo_url)})` }"
          ></span>
          <span v-else class="avatar-nav avatar-menu avatar-nav-initiales">{{ initiales(authStore.user?.nom) }}</span>
          <span class="menu-nom">{{ authStore.user?.nom }}</span>
          <span class="menu-role">{{ authStore.user?.role }}</span>
        </router-link>
        <router-link to="/kanban" @click="menuOuvert = false">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.6"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.6"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.6"/></svg>
          Tableau Kanban
        </router-link>
        <router-link v-if="authStore.estAdmin || authStore.estResponsable" to="/dashboard" @click="menuOuvert = false">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 12l9-9 9 9M5 10v9h5v-5h4v5h5v-9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Tableau de bord
        </router-link>
        <router-link v-if="authStore.estAdmin || authStore.estResponsable" to="/tickets/new" @click="menuOuvert = false">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          Nouveau ticket
        </router-link>
        <router-link v-if="authStore.estAdmin" to="/admin/utilisateurs" @click="menuOuvert = false">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.4"/><path d="M2 13c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          Utilisateurs
        </router-link>
        <router-link to="/profil" @click="menuOuvert = false">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.6"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          Mon profil
        </router-link>
        <button class="menu-deconnexion" @click="deconnecter">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Déconnexion
        </button>
      </div>
    </transition>
  </nav>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter, useRoute } from 'vue-router';
import ClocheNotifications from './ClocheNotifications.vue';
import { urlPhoto } from '../services/api';

const authStore  = useAuthStore();
const router     = useRouter();
const route      = useRoute();
const menuOuvert = ref(false);

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

function initiales(nom) {
  if (!nom) return '?';
  return nom.slice(0, 2).toUpperCase();
}
</script>

<style scoped>
.navbar {
  background: var(--navy);
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 50;
}

.navbar-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}

.brand { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

.pulse {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--accent); animation: pulse 2.2s infinite; flex-shrink: 0;
}
@keyframes pulse {
  0%   { box-shadow: 0 0 0 0   rgba(255,107,53,0.55); }
  70%  { box-shadow: 0 0 0 7px rgba(255,107,53,0); }
  100% { box-shadow: 0 0 0 0   rgba(255,107,53,0); }
}

.logo { font-weight: 700; font-size: 16px; white-space: nowrap; }
.logo-light { color: #aab4c8; font-weight: 500; margin-left: 2px; }

.btn-filtre-icone {
  position: relative; display: flex; align-items: center; gap: 5px;
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.14);
  color: #c4cbda; padding: 5px 10px; border-radius: 7px;
  font-size: 12px; font-weight: 500; cursor: pointer; white-space: nowrap;
}
.btn-filtre-icone.actif { background: rgba(37,99,235,0.35); border-color: #3b82f6; color: #93c5fd; }
.filtre-dot { position: absolute; top: 3px; right: 3px; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }

/* Desktop liens */
.liens { display: flex; align-items: center; gap: 18px; }
.liens a {
  color: #c4cbda; text-decoration: none; font-size: 13px;
  font-weight: 500; padding: 6px 0; position: relative; white-space: nowrap;
}
.liens a:hover { color: #fff; }
.liens a.router-link-active { color: #fff; }
.liens a.router-link-active::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: -2px;
  height: 2px; background: var(--accent); border-radius: 2px;
}
.lien-admin {
  display: flex !important; align-items: center; gap: 4px;
  background: rgba(255,255,255,0.07) !important;
  border: 1px solid rgba(255,255,255,0.14);
  padding: 5px 10px !important; border-radius: 7px;
}
.lien-admin.router-link-active::after { display: none; }
.lien-nouveau {
  background: var(--accent); color: #fff !important;
  padding: 6px 14px !important; border-radius: 7px;
}
.lien-nouveau::after { display: none; }
.lien-nouveau:hover { background: #f0571f; }

.navbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.user-name { color: white; font-size: 13px; font-weight: 600; white-space: nowrap; }
.user-role {
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em;
  background: rgba(255,255,255,0.1); color: #c4cbda;
  padding: 3px 7px; border-radius: 99px; white-space: nowrap;
}
.btn-deconnexion {
  background: transparent; color: #c4cbda;
  border: 1px solid rgba(255,255,255,0.18); padding: 6px 12px;
  border-radius: 6px; font-size: 12px; cursor: pointer; white-space: nowrap;
}
.btn-deconnexion:hover { background: var(--danger); border-color: var(--danger); color: #fff; }

/* Avatar utilisateur (navbar + menu mobile) */
.user-mini {
  display: flex; align-items: center; gap: 8px;
  text-decoration: none; padding: 4px 8px; border-radius: 8px;
  transition: background 0.15s;
}
.user-mini:hover { background: rgba(255,255,255,0.08); }
.avatar-nav {
  width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
  background-size: cover; background-position: center;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; color: white;
}
.avatar-nav-initiales { background-color: var(--accent); }
.avatar-menu { width: 34px; height: 34px; font-size: 12px; }
.menu-user { text-decoration: none; color: inherit; }

/* Burger */
.btn-burger {
  background: none; border: none; cursor: pointer;
  color: #c4cbda; display: flex; align-items: center; padding: 4px;
  border-radius: 6px;
}
.btn-burger:hover { background: rgba(255,255,255,0.1); color: white; }

/* Menu mobile */
.menu-mobile {
  background: #0d1b2e;
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex; flex-direction: column;
}
.menu-mobile a,
.menu-mobile button {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 20px; color: #c4cbda;
  text-decoration: none; font-size: 14px; font-weight: 500;
  background: none; border: none; text-align: left; cursor: pointer;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  transition: background 0.15s;
}
.menu-mobile a:hover,
.menu-mobile button:hover { background: rgba(255,255,255,0.06); color: white; }
.menu-mobile a.router-link-active { color: white; border-left: 3px solid var(--accent); }
.menu-user {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.1);
}
.menu-nom { font-size: 14px; font-weight: 600; color: white; }
.menu-role {
  font-size: 11px; color: #94a3b8; text-transform: uppercase;
  letter-spacing: 0.05em; background: rgba(255,255,255,0.1);
  padding: 2px 8px; border-radius: 99px;
}
.menu-deconnexion { color: #f87171 !important; }

.menu-slide-enter-active, .menu-slide-leave-active { transition: all 0.2s ease; }
.menu-slide-enter-from, .menu-slide-leave-to { opacity: 0; transform: translateY(-6px); }

/* Responsive */
.desktop-only { display: flex !important; }
.mobile-only  { display: none !important; }

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only  { display: flex !important; }
  .filtre-label { display: none; }
  .navbar-main  { padding: 0 14px; }
}
</style>