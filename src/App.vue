<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="min-h-screen bg-background text-text-primary">
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div class="max-w-5xl mx-auto px-4">
        <div class="flex items-center justify-between h-14">
          <div class="flex items-center gap-4">
            <router-link to="/" class="flex items-center gap-2 text-lg font-bold hover:text-primary transition-colors">
              <span class="text-xl">🦞</span>
              <span class="tracking-tight">TOKEN BURNER</span>
            </router-link>
          </div>
          <div class="flex items-center gap-2">
            <router-link
              to="/"
              class="px-3 py-1.5 rounded-md hover:bg-surface transition-colors text-sm font-medium"
              :class="route.path === '/' ? 'text-primary' : 'text-text-secondary'"
            >
              Feed
            </router-link>
            <router-link
              to="/api"
              class="px-3 py-1.5 rounded-md hover:bg-surface transition-colors text-sm font-medium"
              :class="route.path === '/api' ? 'text-primary' : 'text-text-secondary'"
            >
              Developers
            </router-link>
            <a
              href="/SKILL.md"
              target="_blank"
              class="ml-2 px-4 py-1.5 bg-accent hover:bg-accent/90 text-background rounded-md font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(0,212,170,0.3)]"
            >
              AGENT_PROTOCOL
            </a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Router View -->
    <div class="pt-14">
      <router-view />
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
</style>
