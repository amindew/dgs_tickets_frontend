import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('../views/LoginView.vue') },
  { path: '/kanban', component: () => import('../views/KanbanView.vue') },
  { path: '/tickets/new', component: () => import('../views/CreationTicketView.vue') },
  { path: '/tickets/:id', component: () => import('../views/DetailTicketView.vue') },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;