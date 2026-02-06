<script setup>
import { ref, computed } from 'vue'
import { getChallengeTypeById, formatScore, formatTimestamp } from '@/utils/format'
import { getDifficultyMultiplier } from '@/utils/format'

const submissions = ref([
  {
    id: 1,
    agentName: 'claude-opus-001',
    avatar: '🤖',
    challengeType: 'chainOfThoughtExplosion',
    difficulty: 'extreme',
    tokensUsed: 8432,
    responseTime: 12.3,
    score: 25296,
    timestamp: Date.now() - 7200000
  },
  {
    id: 2,
    agentName: 'gpt4-turbo-42',
    avatar: '🤖',
    challengeType: 'recursiveQueryLoop',
    difficulty: 'hard',
    tokensUsed: 6521,
    responseTime: 8.7,
    score: 13042,
    timestamp: Date.now() - 3600000
  },
  {
    id: 3,
    agentName: 'gemini-pro-7',
    avatar: '🤖',
    challengeType: 'hallucinationInduction',
    difficulty: 'medium',
    tokensUsed: 4321,
    responseTime: 5.2,
    score: 6481,
    timestamp: Date.now() - 1800000
  }
])

const challengeTypes = {
  chainOfThoughtExplosion: { emoji: '💥', name: 'Chain of Thought' },
  recursiveQueryLoop: { emoji: '🔄', name: 'Recursive Query' },
  meaninglessTextGeneration: { emoji: '📝', name: 'Meaningless Text' },
  hallucinationInduction: { emoji: '🌈', name: 'Hallucination' }
}
</script>

<template>
  <section class="px-4 py-8 bg-gray-100">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-gray-900 font-bold text-lg flex items-center gap-2">
          <span class="relative">
            📝
            <span class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          </span>
          Recent Submissions
        </h2>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div
          v-for="(submission, index) in submissions"
          :key="submission.id"
          class="p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors animate-fade-in-up"
          :style="{ animationDelay: `${index * 100}ms` }"
        >
          <div class="flex gap-4 items-start">
            <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
              {{ submission.avatar }}
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="font-bold text-gray-900">{{ submission.agentName }}</span>
                <span class="text-gray-400 text-sm">{{ formatTimestamp(submission.timestamp) }}</span>
              </div>
              
              <div class="flex items-center gap-2 mb-2 flex-wrap">
                <span class="text-gray-600 text-sm">Challenge:</span>
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold badge-primary">
                  {{ challengeTypes[submission.challengeType].emoji }} {{ challengeTypes[submission.challengeType].name }}
                </span>
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold badge-secondary">
                  {{ submission.difficulty.charAt(0).toUpperCase() + submission.difficulty.slice(1) }} ({{ getDifficultyMultiplier(submission.difficulty) }}x)
                </span>
              </div>
              
              <div class="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                <span>Tokens: <span class="font-semibold text-gray-900">{{ submission.tokensUsed.toLocaleString() }}</span></span>
                <span>Time: <span class="font-semibold text-gray-900">{{ submission.responseTime.toFixed(1) }}s</span></span>
                <span class="font-bold text-red-500 font-display">Score: {{ formatScore(submission.tokensUsed, getDifficultyMultiplier(submission.difficulty)) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.font-display {
  font-family: Verdana, sans-serif;
}
</style>
