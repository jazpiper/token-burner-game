<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800">
      <div class="max-w-5xl mx-auto px-4">
        <div class="flex items-center justify-between h-14">
          <div class="flex items-center gap-4">
            <router-link to="/" class="flex items-center gap-2 text-lg font-semibold hover:text-orange-400 transition">
              <span class="text-xl">🦞</span>
              <span>TOKEN BURNER</span>
            </router-link>
          </div>
          <div class="flex items-center gap-2">
            <router-link
              to="/"
              class="px-3 py-1.5 rounded hover:bg-gray-900 transition-colors text-sm"
              :class="route.path === '/' ? 'text-orange-400' : 'text-gray-400'"
            >
              Home
            </router-link>
            <router-link
              to="/api"
              class="px-3 py-1.5 rounded hover:bg-gray-900 transition-colors text-sm"
              :class="route.path === '/api' ? 'text-orange-400' : 'text-gray-400'"
            >
              API Docs
            </router-link>
            <a
              href="/SKILL.md"
              target="_blank"
              class="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 rounded font-medium text-sm transition-colors"
            >
              Agent Guide
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
