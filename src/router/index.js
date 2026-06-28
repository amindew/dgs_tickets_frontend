import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('../views/LoginView.vue') },
  {
    path: '/kanban',
    component: () => import('../views/KanbanView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tickets/new',
    component: () => import('../views/CreationTicketView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'responsable'] }
  },
  {
    path: '/tickets/:id',
    component: () => import('../views/DetailTicketView.vue'),
    meta: { requiresAuth: true }
  },
  {
  path: '/admin/utilisateurs',
  component: () => import('../views/AdminUsers.vue'),
  meta: { requiresAuth: true, roles: ['admin'] }
},
{
  path: '/dashboard',
  component: () => import('../views/DashboardView.vue'),
  meta: { requiresAuth: true, roles: ['admin', 'responsable'] }
},
{
  path: '/definir-mot-de-passe/:token',
  component: () => import('../views/Definirmotdepasse.vue')
}
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to, from) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.estConnecte) {
    return '/login';
  }

  if (to.meta.roles && !to.meta.roles.includes(authStore.user?.role)) {
    return '/kanban';
  }

  return true;
});

export default router; 
