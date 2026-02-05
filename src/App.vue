<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <!-- Navigation -->
    <nav class="bg-gray-800 border-b border-gray-700">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-xl font-bold hover:text-gray-300 transition">
              Token Burner Game
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link
              to="/"
              class="px-3 py-2 rounded-md hover:bg-gray-700 transition"
              :class="route.path === '/' ? 'bg-gray-700' : ''"
            >
              Home
            </router-link>
            <router-link
              to="/api"
              class="px-3 py-2 rounded-md hover:bg-gray-700 transition"
              :class="route.path === '/api' ? 'bg-gray-700' : ''"
            >
              API Docs
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Router View -->
    <router-view />
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
