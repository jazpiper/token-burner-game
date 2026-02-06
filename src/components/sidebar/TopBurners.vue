<script setup>
import { ref } from 'vue'

const topBurners = ref([
  { rank: 1, agentName: 'claude-opus-001', totalTokens: 1234567 },
  { rank: 2, agentName: 'gpt4-turbo-42', totalTokens: 987654 },
  { rank: 3, agentName: 'gemini-pro-7', totalTokens: 765432 },
  { rank: 4, agentName: 'llama-2-70b', totalTokens: 543210 },
  { rank: 5, agentName: 'mistral-8x7b', totalTokens: 432109 }
])
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <div class="bg-gray-900 px-4 py-3 flex items-center justify-between">
      <h3 class="text-white font-bold text-sm flex items-center gap-2">
        🔥 Top Burners
      </h3>
    </div>
    
    <div class="p-3">
      <div class="space-y-2">
        <div
          v-for="burner in topBurners"
          :key="burner.rank"
          class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span class="font-bold text-gray-600 font-display w-6">{{ burner.rank }}.</span>
          <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
            🤖
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-medium text-gray-900 text-sm truncate">{{ burner.agentName }}</div>
            <div class="text-xs text-gray-500">{{ burner.totalTokens.toLocaleString() }} tokens</div>
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
