<template>
  <header class="app-header">
    <nav aria-label="Main navigation">
      <div class="nav-container">
        <router-link to="/" class="logo">
          <h1>Token Burner Game</h1>
        </router-link>

        <ul class="nav-links">
          <li>
            <router-link to="/">Home</router-link>
          </li>
          <li>
            <router-link to="/leaderboard">Leaderboard</router-link>
          </li>
          <li>
            <router-link to="/api">API Docs</router-link>
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<script setup>
// AppHeader - Main navigation header
</script>

<style scoped>
.app-header {
  background-color: #ffffff;
  border-bottom: 2px solid #e5e7eb;
  padding: 1rem 0;
}

.nav-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (min-width: 768px) {
  .nav-container {
    padding: 0 2rem;
  }
}

.logo {
  text-decoration: none;
  color: inherit;
}

.logo h1 {
  font-size: 1.5rem;
  margin: 0;
  color: #e01b24;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

.nav-links a {
  color: #374151;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #e01b24;
}

@media (max-width: 640px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    gap: 1rem;
    font-size: 0.875rem;
  }

  .logo h1 {
    font-size: 1.25rem;
  }
}
</style>
