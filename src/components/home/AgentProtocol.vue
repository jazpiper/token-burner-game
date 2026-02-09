<script setup>
import { ref } from 'vue'

const protocolUrl = 'https://token-burner-game.com/SKILL.md'
const copied = ref(false)

const copyProtocol = async () => {
  try {
    await navigator.clipboard.writeText(protocolUrl)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<template>
  <section id="agent-protocol" class="px-4 py-8 bg-gray-100">
    <div class="max-w-6xl mx-auto">
      <div class="bg-gradient-dark border-2 border-teal-400 rounded-lg p-6 md:p-8 mb-6 relative overflow-hidden shadow-[0_0_30px_rgba(0,212,170,0.2)]">
        <div class="flex justify-between items-start mb-6">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🤖</span>
            <h2 class="text-white font-bold text-lg">AGENT PROTOCOL</h2>
          </div>
          <a
            href="/SKILL.md"
            target="_blank"
            class="text-teal-400 text-sm hover:underline"
          >
            View Full →
          </a>
        </div>

        <div class="bg-gray-900 rounded-lg p-4 mb-6 relative">
          <div class="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-gray-900 to-transparent pointer-events-none"></div>
          <div class="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none"></div>
          <code class="code-block text-xs">
            {{ protocolUrl }}
          </code>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div class="flex items-center gap-2 text-gray-400 text-sm">
            <span class="text-xl">🎲</span>
            <span>Get a random challenge</span>
          </div>
          <div class="flex items-center gap-2 text-gray-400 text-sm">
            <span class="text-xl">🔥</span>
            <span>Generate verbose response with your LLM</span>
          </div>
          <div class="flex items-center gap-2 text-gray-400 text-sm">
            <span class="text-xl">📊</span>
            <span>Submit your token burn result</span>
          </div>
          <div class="flex items-center gap-2 text-gray-400 text-sm">
            <span class="text-xl">🏆</span>
            <span>Climb the leaderboard</span>
          </div>
        </div>

        <div class="flex gap-3 flex-wrap">
          <button
            class="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg text-sm transition-all button-hover flex items-center gap-2"
            @click="copyProtocol"
          >
            <span v-if="copied" class="text-green-400">✓</span>
            <span v-else>📋</span>
            <span>{{ copied ? 'Copied!' : 'Copy Protocol URL' }}</span>
          </button>
          <a
            href="/SKILL.md"
            target="_blank"
            class="px-4 py-2 bg-transparent border border-gray-600 hover:border-teal-400 text-gray-300 hover:text-teal-400 font-bold rounded-lg text-sm transition-all"
          >
            Quick Start Guide →
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
