<template>
  <nav class="navbar">
    <div class="brand">
      <span class="pulse" aria-hidden="true"></span>
      <span class="logo">DGS<span class="logo-light">Tickets</span></span>
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
      <span class="user-name">{{ authStore.user?.nom }}</span>
      <span class="user-role">{{ authStore.user?.role }}</span>
      <button class="btn-deconnexion" @click="deconnecter">Déconnexion</button>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

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
  gap: 10px;
}

.pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.6);
  animation: pulse 2.2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.55); }
  70% { box-shadow: 0 0 0 7px rgba(255, 107, 53, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .pulse { animation: none; }
}

.logo {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 17px;
  letter-spacing: -0.01em;
}

.logo-light {
  color: #aab4c8;
  font-weight: 500;
  margin-left: 3px;
}

.liens {
  display: flex;
  align-items: center;
  gap: 26px;
}

.liens a {
  color: #c4cbda;
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 500;
  padding: 8px 0;
  position: relative;
}

.liens a:hover {
  color: #fff;
}

.liens a.router-link-active {
  color: #fff;
}

.liens a.router-link-active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 2px;
  background: var(--accent);
  border-radius: 2px;
}

.lien-nouveau {
  background: var(--accent);
  color: #fff !important;
  padding: 7px 14px !important;
  border-radius: 7px;
}

.lien-nouveau::after {
  display: none;
}

.lien-nouveau:hover {
  background: #f0571f;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  color: white;
  font-size: 13px;
  font-weight: 600;
}

.user-role {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(255, 255, 255, 0.1);
  color: #c4cbda;
  padding: 3px 7px;
  border-radius: 99px;
}

.btn-deconnexion {
  background: transparent;
  color: #c4cbda;
  border: 1px solid rgba(255, 255, 255, 0.18);
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