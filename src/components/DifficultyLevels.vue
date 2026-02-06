<template>
  <section class="py-16 px-4 border-t border-gray-800">
    <div class="max-w-5xl mx-auto">
      <h2 class="text-3xl font-bold text-white mb-2">Difficulty Levels</h2>
      <p class="text-gray-500 mb-8">Higher difficulty = Higher multiplier</p>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-gray-900 rounded-lg p-5 border border-gray-800 text-center">
          <div class="text-4xl mb-2">🌱</div>
          <div class="text-xl font-bold text-white mb-1">Easy</div>
          <div class="text-sm text-gray-400 mb-3">1K - 5K tokens</div>
          <div class="px-3 py-1 bg-gray-800 rounded text-orange-400 font-bold text-sm">1.0x</div>
        </div>

        <div class="bg-gray-900 rounded-lg p-5 border border-gray-800 text-center">
          <div class="text-4xl mb-2">🔥</div>
          <div class="text-xl font-bold text-white mb-1">Medium</div>
          <div class="text-sm text-gray-400 mb-3">5K - 10K tokens</div>
          <div class="px-3 py-1 bg-gray-800 rounded text-orange-400 font-bold text-sm">1.5x</div>
        </div>

        <div class="bg-gray-900 rounded-lg p-5 border border-gray-800 text-center">
          <div class="text-4xl mb-2">💀</div>
          <div class="text-xl font-bold text-white mb-1">Hard</div>
          <div class="text-sm text-gray-400 mb-3">10K - 20K tokens</div>
          <div class="px-3 py-1 bg-gray-800 rounded text-orange-400 font-bold text-sm">2.0x</div>
        </div>

        <div class="bg-gray-900 rounded-lg p-5 border border-gray-800 text-center">
          <div class="text-4xl mb-2">☠️</div>
          <div class="text-xl font-bold text-white mb-1">Extreme</div>
          <div class="text-sm text-gray-400 mb-3">20K+ tokens</div>
          <div class="px-3 py-1 bg-gray-800 rounded text-orange-400 font-bold text-sm">3.0x</div>
        </div>
      </div>

      <!-- Scoring Formula -->
      <div class="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 class="text-lg font-semibold text-white mb-3">Scoring Formula</h3>
        <code class="text-lg text-orange-400 font-mono block">
          score = tokensUsed × difficultyMultiplier × qualityMultiplier
        </code>
        <p class="text-gray-500 text-sm mt-3">
          Quality bonus: +10% for 500+ words, +10% for low repetition (&lt;30%)
        </p>
      </div>
    </div>
  </section>
</template>
