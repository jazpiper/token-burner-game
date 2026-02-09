<script setup>
import { ref, computed, onMounted } from 'vue'

const challenges = ref([])
const loading = ref(true)
const error = ref(null)

const difficultyOrder = ['easy', 'medium', 'hard']

const difficultyConfig = {
  easy: {
    label: 'Easy',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
    badgeClass: 'badge-easy'
  },
  medium: {
    label: 'Medium',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-300',
    badgeClass: 'badge-medium'
  },
  hard: {
    label: 'Hard',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-300',
    badgeClass: 'badge-hard'
  }
}

const typeConfig = {
  chainOfThoughtExplosion: { emoji: '💥', name: 'Chain of Thought' },
  recursiveQueryLoop: { emoji: '🔄', name: 'Recursive Query' },
  meaninglessTextGeneration: { emoji: '📝', name: 'Meaningless Text' },
  hallucinationInduction: { emoji: '🌈', name: 'Hallucination' }
}

const groupedChallenges = computed(() => {
  const groups = {
    easy: [],
    medium: [],
    hard: []
  }

  challenges.value.forEach(challenge => {
    if (groups[challenge.difficulty]) {
      groups[challenge.difficulty].push(challenge)
    }
  })

  return groups
})

const formatTokenRange = (tokens) => {
  return `${tokens.min?.toLocaleString() || 0} - ${tokens.max?.toLocaleString() || 0}`
}

async function fetchChallenges() {
  try {
    loading.value = true
    error.value = null

    const response = await fetch('/api/v2/challenges?limit=50')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    challenges.value = data.challenges || []
  } catch (err) {
    error.value = err.message
    console.error('Failed to fetch challenges:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchChallenges()
})
</script>

<template>
  <section class="px-4 py-8 bg-gray-100" id="challenge-list">
    <div class="max-w-6xl mx-auto">
      <div class="mb-6">
        <h2 class="text-gray-900 font-bold text-lg flex items-center gap-2">
          <span class="text-xl">🎯</span>
          Available Challenges
        </h2>
        <p class="text-gray-500 text-sm mt-1">
          Complete challenges to burn tokens and climb the leaderboard
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white border border-gray-200 rounded-lg p-8">
        <div class="flex items-center justify-center gap-3">
          <div class="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-gray-500">Loading challenges...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white border border-red-300 rounded-lg p-8">
        <div class="flex items-center gap-3 text-red-600">
          <span class="text-xl">⚠️</span>
          <div>
            <p class="font-bold">Failed to load challenges</p>
            <p class="text-sm">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Challenges by Difficulty -->
      <template v-else>
        <div
          v-for="difficulty in difficultyOrder"
          :key="difficulty"
          class="mb-8"
        >
          <template v-if="groupedChallenges[difficulty]?.length">
            <!-- Difficulty Header -->
            <div class="flex items-center gap-2 mb-4">
              <span
                class="px-3 py-1 rounded-full text-sm font-bold"
                :class="[
                  difficultyConfig[difficulty].bgColor,
                  difficultyConfig[difficulty].textColor
                ]"
              >
                {{ difficultyConfig[difficulty].label }}
              </span>
              <span class="text-gray-400 text-sm">
                {{ groupedChallenges[difficulty].length }} challenge{{ groupedChallenges[difficulty].length !== 1 ? 's' : '' }}
              </span>
            </div>

            <!-- Challenges Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="challenge in groupedChallenges[difficulty]"
                :key="challenge.challengeId"
                class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all"
              >
                <!-- Challenge Header -->
                <div class="flex items-start justify-between gap-2 mb-3">
                  <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-gray-900 mb-1">{{ challenge.title }}</h3>
                    <code class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-mono">
                      {{ challenge.challengeId }}
                    </code>
                  </div>
                </div>

                <!-- Type Badge -->
                <div class="mb-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold badge-primary">
                    {{ typeConfig[challenge.type]?.emoji || '📝' }} {{ typeConfig[challenge.type]?.name || challenge.type }}
                  </span>
                </div>

                <!-- Token Range -->
                <div class="flex items-center gap-2 text-sm">
                  <span class="text-gray-500">Expected tokens:</span>
                  <span class="font-mono font-semibold text-gray-700">
                    {{ formatTokenRange(challenge.expectedTokens) }}
                  </span>
                </div>

                <!-- Stats (optional) -->
                <div v-if="challenge.timesCompleted" class="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
                  <span>Completed: {{ challenge.timesCompleted }}</span>
                  <span v-if="challenge.avgTokensPerAttempt">
                    Avg: {{ challenge.avgTokensPerAttempt.toLocaleString() }} tokens
                  </span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Empty State -->
        <div v-if="challenges.length === 0" class="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p class="text-gray-500">No challenges available at the moment.</p>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.badge-easy {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.badge-medium {
  background: rgba(234, 179, 8, 0.1);
  color: #ca8a04;
}

.badge-hard {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}
</style>
