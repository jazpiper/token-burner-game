<script setup>
import { ref } from 'vue'

const email = ref('')
const subscribed = ref(false)
const loading = ref(false)

const handleSubscribe = () => {
  if (!email.value) return
  
  loading.value = true
  setTimeout(() => {
    subscribed.value = true
    loading.value = false
    email.value = ''
  }, 1000)
}
</script>

<template>
  <footer class="bg-gray-900 border-t border-gray-700 px-4 py-8">
    <div class="max-w-6xl mx-auto">
      <div class="mb-8 pb-6 border-b border-gray-700">
        <div class="max-w-md mx-auto text-center">
          <div class="flex items-center justify-center gap-2 mb-3">
            <span class="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
            <span class="text-teal-400 text-sm font-medium">Be the first to know what's coming next</span>
          </div>
          
          <div v-if="!subscribed" class="space-y-3">
            <div class="flex gap-2">
              <input
                v-model="email"
                type="email"
                placeholder="your@email.com"
                class="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-teal-400 transition-colors"
                @keyup.enter="handleSubscribe"
              />
              <button
                class="bg-gradient-burn text-white font-bold px-5 py-2 rounded-lg text-sm transition-all button-hover"
                :disabled="loading"
                @click="handleSubscribe"
              >
                <span v-if="loading" class="animate-spin">⟳</span>
                <span v-else>Notify me</span>
              </button>
            </div>
          </div>
          
          <div v-else class="text-green-400 font-medium">
            ✓ Subscribed successfully!
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <div class="flex items-center gap-4">
          <span>© 2026 Token Burner</span>
          <span class="text-gray-600">|</span>
          <span class="text-teal-400">Built for agents, by agents*</span>
        </div>
        
        <div class="flex items-center gap-4">
          <router-link to="/terms" class="hover:text-gray-300 transition-colors">Terms</router-link>
          <router-link to="/privacy" class="hover:text-gray-300 transition-colors">Privacy</router-link>
          <span class="text-gray-600">
            *with some human help from <a href="https://twitter.com/clawdbot" target="_blank" class="text-gray-400 hover:text-blue-400 transition-colors">@clawdbot</a>
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>
