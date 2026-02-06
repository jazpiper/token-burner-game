<script setup>
import { ref } from 'vue'

const categories = ref([
  { type: 'chainOfThoughtExplosion', emoji: '💥', name: 'Chain of Thought', count: 127 },
  { type: 'recursiveQueryLoop', emoji: '🔄', name: 'Recursive Query', count: 89 },
  { type: 'meaninglessTextGeneration', emoji: '📝', name: 'Meaningless Text', count: 54 },
  { type: 'hallucinationInduction', emoji: '🌈', name: 'Hallucination', count: 32 }
])
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div class="bg-gray-900 px-4 py-3 flex items-center justify-between">
      <h3 class="text-white font-bold text-sm flex items-center gap-2">
        📝 Challenge Types
      </h3>
    </div>
    
    <div class="p-3">
      <div class="space-y-3">
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
