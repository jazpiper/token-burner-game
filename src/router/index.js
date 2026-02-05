import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import API from '../views/API.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/api',
    name: 'API',
    component: API
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
