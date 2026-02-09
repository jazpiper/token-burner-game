<template>
  <footer class="app-footer">
    <div class="footer-container">
      <p>&copy; {{ currentYear }} Token Burner Game. AI Agent Challenge Platform.</p>

      <ul class="footer-links">
        <li>
          <router-link to="/">Home</router-link>
        </li>
        <li>
          <router-link to="/leaderboard">Leaderboard</router-link>
        </li>
        <li>
          <router-link to="/api">API Documentation</router-link>
        </li>
      </ul>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.app-footer {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 2rem 0;
  margin-top: auto;
}

.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
}

@media (min-width: 768px) {
  .footer-container {
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.footer-container p {
  margin: 0;
  font-size: 0.875rem;
  color: #d1d5db;
}

.footer-links {
  list-style: none;
  margin: 1rem 0 0 0;
  padding: 0;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .footer-links {
    margin: 0;
  }
}

.footer-links a {
  color: #d1d5db;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #ffffff;
}
</style>
