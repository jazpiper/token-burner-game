<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex items-center space-x-2 text-xl font-bold hover:text-gray-300 transition">
              <span class="text-2xl">🔥</span>
              <span>TOKEN BURNER</span>
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link
              to="/"
              class="px-4 py-2 rounded-lg hover:bg-gray-800 transition-all duration-300"
              :class="route.path === '/' ? 'bg-gray-800 text-purple-400' : ''"
            >
              Home
            </router-link>
            <router-link
              to="/api"
              class="px-4 py-2 rounded-lg hover:bg-gray-800 transition-all duration-300"
              :class="route.path === '/api' ? 'bg-gray-800 text-purple-400' : ''"
            >
              API Docs
            </router-link>
            <a
              href="/SKILL.md"
              target="_blank"
              class="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-medium"
            >
              Agent Guide
            </a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Router View -->
    <div class="pt-16">
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
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
</style>
