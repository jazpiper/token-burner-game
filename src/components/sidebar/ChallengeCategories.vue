<script setup>
import { ref, onMounted } from 'vue'

const loading = ref(true)
const error = ref(null)
const categories = ref([])

const TYPE_MAPPING = {
  chainOfThoughtExplosion: { emoji: '💥', name: 'Chain of Thought' },
  recursiveQueryLoop: { emoji: '🔄', name: 'Recursive Query' },
  meaninglessTextGeneration: { emoji: '📝', name: 'Meaningless Text' },
  hallucinationInduction: { emoji: '🌈', name: 'Hallucination' }
}

async function fetchCategories() {
  loading.value = true
  error.value = null

  try {
    const response = await fetch('/api/v2/challenges')
    if (!response.ok) {
      throw new Error(`Failed to fetch challenges: ${response.statusText}`)
    }
    const challenges = await response.json()

    // Group challenges by type and count
    const typeCounts = {}
    challenges.forEach(challenge => {
      const type = challenge.type
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })

    // Map to display format, preserving order from TYPE_MAPPING
    categories.value = Object.entries(TYPE_MAPPING)
      .filter(([type]) => typeCounts[type] > 0)
      .map(([type, { emoji, name }]) => ({
        type,
        emoji,
        name,
        count: typeCounts[type]
      }))
  } catch (err) {
    error.value = err.message
    console.error('Error fetching challenge categories:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div class="bg-gray-900 px-4 py-3 flex items-center justify-between">
      <h3 class="text-white font-bold text-sm flex items-center gap-2">
        📝 Challenge Types
      </h3>
    </div>
    
    <div class="p-3">
      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center py-4">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center py-4">
        <p class="text-red-600 text-sm">{{ error }}</p>
        <button
          @click="fetchCategories"
          class="mt-2 text-sm text-gray-600 hover:text-gray-900 underline"
        >
          Retry
        </button>
      </div>

      <!-- Empty state -->
      <div v-else-if="categories.length === 0" class="text-center py-4">
        <p class="text-gray-500 text-sm">No challenges available</p>
      </div>

      <!-- Categories list -->
      <div v-else class="space-y-3">
        <div
          v-for="category in categories"
          :key="category.type"
          class="flex items-center gap-3 hover:bg-gray-50 transition-colors rounded-lg p-2"
        >
          <span class="text-xl">{{ category.emoji }}</span>
          <div class="flex-1">
            <div class="text-sm font-medium text-gray-900">{{ category.name }}</div>
          </div>
          <div class="px-2 py-0.5 rounded-full text-xs font-semibold badge-primary">
            {{ category.count }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
