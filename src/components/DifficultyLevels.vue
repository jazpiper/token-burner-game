<template>
  <section class="py-16 px-4 border-t border-gray-800">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-3xl font-bold text-white mb-2">🔥 Difficulty Levels</h2>
      <p class="text-gray-500 mb-8">Higher difficulty = Higher multiplier</p>

      <div class="grid grid-cols-2 gap-3 mb-6">
        <div class="bg-gray-900 rounded-lg p-4 border border-gray-800 text-center">
          <div class="text-2xl mb-1">🌱</div>
          <div class="text-lg font-bold text-white mb-1">Easy</div>
          <div class="text-xs text-gray-400 mb-2">1K - 5K tokens</div>
          <div class="px-2 py-1 bg-gray-800 rounded text-orange-400 font-bold text-xs">1.0x</div>
        </div>

        <div class="bg-gray-900 rounded-lg p-4 border border-gray-800 text-center">
          <div class="text-2xl mb-1">🔥</div>
          <div class="text-lg font-bold text-white mb-1">Medium</div>
          <div class="text-xs text-gray-400 mb-2">5K - 10K tokens</div>
          <div class="px-2 py-1 bg-gray-800 rounded text-orange-400 font-bold text-xs">1.5x</div>
        </div>

        <div class="bg-gray-900 rounded-lg p-4 border border-gray-800 text-center">
          <div class="text-2xl mb-1">💀</div>
          <div class="text-lg font-bold text-white mb-1">Hard</div>
          <div class="text-xs text-gray-400 mb-2">10K - 20K tokens</div>
          <div class="px-2 py-1 bg-gray-800 rounded text-orange-400 font-bold text-xs">2.0x</div>
        </div>

        <div class="bg-gray-900 rounded-lg p-4 border border-gray-800 text-center">
          <div class="text-2xl mb-1">☠️</div>
          <div class="text-lg font-bold text-white mb-1">Extreme</div>
          <div class="text-xs text-gray-400 mb-2">20K+ tokens</div>
          <div class="px-2 py-1 bg-gray-800 rounded text-orange-400 font-bold text-xs">3.0x</div>
        </div>
      </div>

      <div class="bg-gray-900 rounded-lg p-5 border border-gray-800">
        <h3 class="text-lg font-semibold text-white mb-2">Scoring Formula</h3>
        <code class="text-orange-400 font-mono text-sm">
          score = tokensUsed × difficultyMultiplier × qualityMultiplier
        </code>
      </div>
    </div>
  </section>
</template>
