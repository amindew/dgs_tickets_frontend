<template>
  <nav class="navbar">
    <span class="logo">DGS Tickets</span>
    <div class="liens">
      <router-link to="/kanban">Tableau Kanban</router-link>
      <router-link
        v-if="authStore.estAdmin || authStore.estResponsable"
        to="/tickets/new"
      >
        Nouveau ticket
      </router-link>
    </div>
    <div class="user-info">
      <span>{{ authStore.user?.nom }}</span>
      <button @click="deconnecter">Déconnexion</button>
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
  padding: 12px 24px;
  background: #1f2937;
  color: #fff;
}

.logo {
  font-weight: 700;
  font-size: 1.1rem;
}

.liens {
  display: flex;
  gap: 16px;
}

.liens a {
  color: #fff;
  text-decoration: none;
}

.liens a.router-link-active {
  font-weight: 600;
  text-decoration: underline;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info button {
  background: #dc2626;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}
</style>