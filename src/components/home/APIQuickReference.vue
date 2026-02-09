<script setup>
import { ref } from 'vue'

const expandedCategories = ref(new Set(['Authentication']))

const toggleCategory = (category) => {
  if (expandedCategories.value.has(category)) {
    expandedCategories.value.delete(category)
  } else {
    expandedCategories.value.add(category)
  }
}

const apiCategories = [
  {
    name: 'Authentication',
    endpoints: [
      { method: 'POST', path: '/api/v2/keys/register', description: 'Register a new API key' },
      { method: 'POST', path: '/api/v2/auth/token', description: 'Exchange key for access token' }
    ]
  },
  {
    name: 'Challenges',
    endpoints: [
      { method: 'GET', path: '/api/v2/challenges', description: 'List all available challenges' },
      { method: 'GET', path: '/api/v2/challenges/random', description: 'Get a random challenge' }
    ]
  },
  {
    name: 'Submissions',
    endpoints: [
      { method: 'POST', path: '/api/v2/submissions', description: 'Submit a challenge solution' },
      { method: 'GET', path: '/api/v2/submissions/:id', description: 'Get submission by ID' }
    ]
  },
  {
    name: 'Leaderboard',
    endpoints: [
      { method: 'GET', path: '/api/v2/leaderboard', description: 'Get ranked leaderboard' }
    ]
  },
  {
    name: 'Games',
    endpoints: [
      { method: 'POST', path: '/api/v2/games/start', description: 'Start a new game session' },
      { method: 'POST', path: '/api/v2/games/finish', description: 'Complete a game session' }
    ]
  }
]

const methodClasses = {
  GET: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  POST: 'bg-green-500/20 text-green-400 border-green-500/30',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
  PUT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PATCH: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
}
</script>

<template>
  <section class="px-4 py-8 bg-gray-100">
    <div class="max-w-7xl mx-auto">
      <div class="bg-gradient-dark border-2 border-teal-500 rounded-lg p-6 md:p-8 shadow-[0_0_30px_rgba(0,212,170,0.2)]">
        <h2 class="text-white font-bold text-xl mb-6 flex items-center gap-2">
          <span class="text-2xl">📡</span>
          API Quick Reference
        </h2>

        <div class="space-y-3">
          <div
            v-for="category in apiCategories"
            :key="category.name"
            class="border border-gray-700 rounded-lg overflow-hidden"
          >
            <button
              @click="toggleCategory(category.name)"
              class="w-full flex items-center justify-between p-4 bg-gray-900 hover:bg-gray-800 transition-colors"
            >
              <span class="text-white font-semibold">{{ category.name }}</span>
              <span
                class="text-teal-400 transition-transform"
                :class="{ 'rotate-180': expandedCategories.has(category.name) }"
              >
                ▼
              </span>
            </button>

            <div
              v-show="expandedCategories.has(category.name)"
              class="p-4 bg-gray-900/50 border-t border-gray-700"
            >
              <div class="space-y-3">
                <div
                  v-for="(endpoint, idx) in category.endpoints"
                  :key="idx"
                  class="flex items-start gap-3 p-3 bg-gray-800 rounded-lg"
                >
                  <span
                    class="px-2 py-1 text-xs font-bold border rounded flex-shrink-0"
                    :class="methodClasses[endpoint.method]"
                  >
                    {{ endpoint.method }}
                  </span>
                  <code class="text-teal-400 text-sm font-mono flex-shrink-0">
                    {{ endpoint.path }}
                  </code>
                  <span class="text-gray-400 text-sm">{{ endpoint.description }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
