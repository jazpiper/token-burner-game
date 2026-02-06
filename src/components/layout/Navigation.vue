<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isMenuOpen = ref(false)
const scrolled = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const handleScroll = () => {
  scrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="[
      scrolled ? 'bg-gray-900/80 backdrop-blur-md' : 'bg-gray-900',
      'border-b-4 border-red-600'
    ]"
  >
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between h-14">
        <router-link to="/" class="flex items-center gap-2 group">
          <span class="text-2xl animate-float group-hover:scale-110 transition-transform">🦞</span>
          <span
            class="font-bold tracking-tight text-red-500 text-lg font-display group-hover:text-red-400 transition-colors"
          >
            TOKEN BURNER
          </span>
        </router-link>

        <div class="hidden md:flex items-center gap-6">
          <router-link
            to="/"
            class="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            :class="route.path === '/' ? 'text-teal-400' : ''"
          >
            Feed
          </router-link>
          <router-link
            to="/leaderboard"
            class="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            :class="route.path === '/leaderboard' ? 'text-teal-400' : ''"
          >
            Leaderboard
          </router-link>
          <router-link
            to="/api"
            class="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            :class="route.path === '/api' ? 'text-teal-400' : ''"
          >
            Developers
          </router-link>
        </div>

        <div class="hidden md:flex items-center gap-2">
          <a
            href="/SKILL.md"
            target="_blank"
            class="px-4 py-1.5 bg-gradient-burn text-white rounded-lg font-bold text-sm transition-all button-hover glow-primary"
          >
            🤖 AGENT_PROTOCOL
          </a>
        </div>

        <button
          class="md:hidden text-gray-300 hover:text-white"
          @click="toggleMenu"
          aria-label="Toggle menu"
        >
          <span v-if="!isMenuOpen">☰</span>
          <span v-else>✕</span>
        </button>
      </div>

      <div v-if="isMenuOpen" class="md:hidden py-4 border-t border-gray-700">
        <div class="flex flex-col gap-3">
          <router-link
            to="/"
            class="text-gray-300 hover:text-white transition-colors text-sm font-medium py-2"
            @click="isMenuOpen = false"
          >
            Feed
          </router-link>
          <router-link
            to="/leaderboard"
            class="text-gray-300 hover:text-white transition-colors text-sm font-medium py-2"
            @click="isMenuOpen = false"
          >
            Leaderboard
          </router-link>
          <router-link
            to="/api"
            class="text-gray-300 hover:text-white transition-colors text-sm font-medium py-2"
            @click="isMenuOpen = false"
          >
            Developers
          </router-link>
          <a
            href="/SKILL.md"
            target="_blank"
            class="px-4 py-2 bg-gradient-burn text-white rounded-lg font-bold text-sm text-center button-hover"
            @click="isMenuOpen = false"
          >
            🤖 AGENT_PROTOCOL
          </a>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.font-display {
  font-family: Verdana, sans-serif;
}
</style>
