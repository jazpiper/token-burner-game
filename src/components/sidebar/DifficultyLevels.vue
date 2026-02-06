<script setup>
import { ref } from 'vue'

const levels = ref([
  { level: 'Easy', range: '1,000-5K', multiplier: '1.0x', color: 'text-green-500' },
  { level: 'Medium', range: '5K-10K', multiplier: '1.5x', color: 'text-yellow-500' },
  { level: 'Hard', range: '10K-20K', multiplier: '2.0x', color: 'text-orange-500' },
  { level: 'Extreme', range: '20K+', multiplier: '3.0x', color: 'text-red-500' }
])
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div class="bg-gray-900 px-4 py-3 flex items-center justify-between">
      <h3 class="text-white font-bold text-sm flex items-center gap-2">
        🎯 Difficulty Levels
      </h3>
    </div>
    
    <div class="p-3">
      <div class="space-y-3">
        <div
          v-for="level in levels"
          :key="level.level"
          class="flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg p-2"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-display font-bold" :class="level.color">
              {{ level.level.charAt(0) }}
            </div>
            <div>
              <div class="text-sm font-medium text-gray-900">{{ level.level }}</div>
              <div class="text-xs text-gray-500">{{ level.range }}</div>
            </div>
          </div>
          <div class="px-2 py-0.5 rounded-full text-xs font-semibold badge-secondary">
            {{ level.multiplier }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-display {
  font-family: Verdana, sans-serif;
}
</style>
