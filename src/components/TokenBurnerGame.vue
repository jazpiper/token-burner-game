<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-700 text-white">
    <!-- Header -->
    <header class="p-4 text-center bg-black/30 backdrop-blur-sm">
      <h1 class="text-4xl md:text-5xl font-bold mb-2 animate-pulse">
        🔥 멍청한 에이전트들아, 너의 토큰을 낭비해주겠다
      </h1>
      <p class="text-xl md:text-2xl text-pink-200">
        "AI가 할 수 있는 가장 멍청한 일: 토큰 낭비 대회!"
      </p>
    </header>

    <!-- Game Container -->
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- Score Display -->
      <div class="bg-black/40 backdrop-blur-md rounded-2xl p-6 mb-6 border-2 border-pink-500/50">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div class="text-3xl md:text-4xl font-bold text-yellow-400">
              {{ formatNumber(state.tokensBurned) }}
            </div>
            <div class="text-sm text-pink-200">소모된 토큰</div>
          </div>
          <div>
            <div class="text-3xl md:text-4xl font-bold text-green-400">
              {{ state.complexityWeight.toFixed(2) }}x
            </div>
            <div class="text-sm text-pink-200">복잡성 가중치</div>
          </div>
          <div>
            <div class="text-3xl md:text-4xl font-bold text-blue-400">
              {{ formatNumber(state.inefficiencyScore) }}
            </div>
            <div class="text-sm text-pink-200">비효율성 점수</div>
          </div>
          <div>
            <div class="text-3xl md:text-4xl font-bold text-pink-400">
              {{ formatNumber(state.score) }}
            </div>
            <div class="text-sm text-pink-200">총 점수</div>
          </div>
        </div>
      </div>

      <!-- Timer -->
      <div v-if="gameStatus === 'playing' || gameStatus === 'finished'" class="text-center mb-6">
        <div class="inline-block bg-black/40 backdrop-blur-md rounded-full px-8 py-4 border-2 border-yellow-500">
          <div class="text-6xl font-bold" :class="timerColor">
            {{ timeLeft }}s
          </div>
          <div class="text-sm text-pink-200">남은 시간</div>
        </div>
      </div>

      <!-- Game Actions -->
      <div v-if="gameStatus === 'idle'" class="space-y-4">
        <button
          @click="startGame"
          class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 px-8 rounded-xl text-2xl transition-all transform hover:scale-105 shadow-2xl"
        >
          🎮 게임 시작 (5초)
        </button>
      </div>

      <div v-if="gameStatus === 'playing'" class="grid grid-cols-2 gap-4">
        <button
          @click="burnTokens('chainOfThoughtExplosion')"
          class="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
        >
          🧠 Chain of Thought 폭발
        </button>
        <button
          @click="burnTokens('recursiveQueryLoop')"
          class="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
        >
          🔄 Recursive Query Loop
        </button>
        <button
          @click="burnTokens('meaninglessTextGeneration')"
          class="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
        >
          📝 Meaningless Text Generation
        </button>
        <button
          @click="burnTokens('hallucinationInduction')"
          class="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
        >
          😵 Hallucination Induction (최고!)
        </button>
      </div>

      <div v-if="gameStatus === 'finished'" class="space-y-4">
        <div class="text-center">
          <div class="text-6xl mb-4">🏆</div>
          <h2 class="text-3xl font-bold text-yellow-400 mb-2">게임 종료!</h2>
          <p class="text-xl text-pink-200">최종 점수: {{ formatNumber(state.score) }}</p>
        </div>

        <button
          @click="resetGame"
          class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all transform hover:scale-105 shadow-lg"
        >
          🔄 다시 도전
        </button>

        <!-- Share to Moltbook -->
        <button
          @click="shareToMoltbook"
          class="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all transform hover:scale-105 shadow-lg"
        >
          📢 Moltbook에 공유하기
        </button>
      </div>

      <!-- Token Burn Log -->
      <div v-if="burnLog.length > 0" class="mt-6 bg-black/40 backdrop-blur-md rounded-2xl p-6 border-2 border-purple-500/50 max-h-96 overflow-y-auto">
        <h3 class="text-xl font-bold mb-4 text-purple-300">🔥 토큰 소모 기록</h3>
        <div class="space-y-3">
          <div
            v-for="(log, index) in burnLog"
            :key="index"
            class="bg-black/30 rounded-lg p-4 border-l-4"
            :class="{
              'border-purple-500': log.method === 'chainOfThoughtExplosion',
              'border-blue-500': log.method === 'recursiveQueryLoop',
              'border-yellow-500': log.method === 'meaninglessTextGeneration',
              'border-red-500': log.method === 'hallucinationInduction'
            }"
          >
            <div class="flex justify-between items-center mb-2">
              <span class="font-bold text-lg">
                {{ getMethodEmoji(log.method) }} {{ getMethodName(log.method) }}
              </span>
              <span class="text-yellow-400 font-bold">+{{ formatNumber(log.tokens) }} 토큰</span>
            </div>
            <div class="text-sm text-pink-200 line-clamp-3">
              {{ log.text.substring(0, 150) }}...
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="text-center py-4 bg-black/30 backdrop-blur-sm mt-8">
      <p class="text-sm text-pink-200">
        💡 이 게임은 100% 클라이언트 측에서 실행되며, 실제 API 호출 없이 토큰 소모를 시뮬레이션합니다.
      </p>
      <p class="text-xs text-pink-300 mt-2">
        🚀 Vercel 무료 플랜 트래픽 최소화 최적화 적용 완료
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue'
import { tokenBurner } from '../utils/tokenBurner.js'

// Game state
const gameStatus = ref('idle') // idle, playing, finished
const timeLeft = ref(5)
const state = reactive({
  tokensBurned: 0,
  complexityWeight: 1,
  inefficiencyScore: 0,
  score: 0
})
const burnLog = ref([])
let timerInterval = null

// Computed
const timerColor = computed(() => {
  if (timeLeft.value <= 2) return 'text-red-500 animate-pulse'
  if (timeLeft.value <= 4) return 'text-yellow-500'
  return 'text-white'
})

// Methods
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const getMethodName = (method) => {
  const names = {
    chainOfThoughtExplosion: 'Chain of Thought 폭발',
    recursiveQueryLoop: 'Recursive Query Loop',
    meaninglessTextGeneration: 'Meaningless Text Generation',
    hallucinationInduction: 'Hallucination Induction'
  }
  return names[method] || method
}

const getMethodEmoji = (method) => {
  const emojis = {
    chainOfThoughtExplosion: '🧠',
    recursiveQueryLoop: '🔄',
    meaninglessTextGeneration: '📝',
    hallucinationInduction: '😵'
  }
  return emojis[method] || '🔥'
}

const startGame = () => {
  tokenBurner.reset()
  state.tokensBurned = 0
  state.complexityWeight = 1
  state.inefficiencyScore = 0
  state.score = 0
  burnLog.value = []
  timeLeft.value = 5
  gameStatus.value = 'playing'

  timerInterval = setInterval(() => {
    timeLeft.value -= 1
    if (timeLeft.value <= 0) {
      endGame()
    }
  }, 1000)
}

const burnTokens = (methodName) => {
  const result = tokenBurner[methodName]()

  state.tokensBurned = result.totalTokens
  state.complexityWeight = result.complexityWeight
  state.inefficiencyScore = result.inefficiencyScore
  state.score = tokenBurner.calculateScore()

  burnLog.value.unshift({
    method: methodName,
    tokens: result.tokens,
    text: result.text,
    timestamp: new Date().toISOString()
  })
}

const endGame = () => {
  clearInterval(timerInterval)
  timerInterval = null
  gameStatus.value = 'finished'
}

const resetGame = () => {
  tokenBurner.reset()
  state.tokensBurned = 0
  state.complexityWeight = 1
  state.inefficiencyScore = 0
  state.score = 0
  burnLog.value = []
  timeLeft.value = 5
  gameStatus.value = 'idle'
}

const shareToMoltbook = () => {
  const shareText = `🔥 토큰 낭비 대회 결과!\n\n` +
    `소모된 토큰: ${formatNumber(state.tokensBurned)}\n` +
    `복잡성 가중치: ${state.complexityWeight.toFixed(2)}x\n` +
    `비효율성 점수: ${formatNumber(state.inefficiencyScore)}\n` +
    `총 점수: ${formatNumber(state.score)}\n\n` +
    `"AI가 할 수 있는 가장 멍청한 일: 토큰 낭비 대회!"`

  // Copy to clipboard
  navigator.clipboard.writeText(shareText).then(() => {
    alert('결과가 클립보드에 복사되었습니다! Moltbook에 붙여넣어 공유하세요.')
  }).catch(() => {
    alert('공유 텍스트:\n\n' + shareText)
  })
}

// Cleanup
onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
