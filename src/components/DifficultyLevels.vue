<template>
  <section class="py-20 px-4 bg-gray-900">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 via-yellow-500 to-red-500 bg-clip-text text-transparent">
          Difficulty Levels
        </h2>
        <p class="text-gray-400">Higher difficulty = Higher multiplier</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-gradient-to-br from-green-900/50 to-green-950/30 rounded-xl p-8 text-center border border-green-800/50 hover:border-green-500 transition-all duration-300 hover:scale-105">
          <div class="text-5xl mb-4">🌱</div>
          <div class="text-3xl font-black text-green-400 mb-2">Easy</div>
          <div class="text-lg text-gray-400 mb-4">1,000 - 5,000 tokens</div>
          <div class="inline-block px-4 py-2 bg-green-500/20 rounded-full">
            <span class="text-green-400 font-bold">1.0x</span>
          </div>
        </div>

        <div class="bg-gradient-to-br from-yellow-900/50 to-yellow-950/30 rounded-xl p-8 text-center border border-yellow-800/50 hover:border-yellow-500 transition-all duration-300 hover:scale-105">
          <div class="text-5xl mb-4">🔥</div>
          <div class="text-3xl font-black text-yellow-400 mb-2">Medium</div>
          <div class="text-lg text-gray-400 mb-4">5,000 - 10,000 tokens</div>
          <div class="inline-block px-4 py-2 bg-yellow-500/20 rounded-full">
            <span class="text-yellow-400 font-bold">1.5x</span>
          </div>
        </div>

        <div class="bg-gradient-to-br from-orange-900/50 to-orange-950/30 rounded-xl p-8 text-center border border-orange-800/50 hover:border-orange-500 transition-all duration-300 hover:scale-105">
          <div class="text-5xl mb-4">💀</div>
          <div class="text-3xl font-black text-orange-400 mb-2">Hard</div>
          <div class="text-lg text-gray-400 mb-4">10,000 - 20,000 tokens</div>
          <div class="inline-block px-4 py-2 bg-orange-500/20 rounded-full">
            <span class="text-orange-400 font-bold">2.0x</span>
          </div>
        </div>

        <div class="bg-gradient-to-br from-red-900/50 to-red-950/30 rounded-xl p-8 text-center border border-red-800/50 hover:border-red-500 transition-all duration-300 hover:scale-105">
          <div class="text-5xl mb-4">☠️</div>
          <div class="text-3xl font-black text-red-400 mb-2">Extreme</div>
          <div class="text-lg text-gray-400 mb-4">20,000+ tokens</div>
          <div class="inline-block px-4 py-2 bg-red-500/20 rounded-full">
            <span class="text-red-400 font-bold">3.0x</span>
          </div>
        </div>
      </div>

      <!-- Scoring Formula -->
      <div class="mt-16 text-center">
        <div class="inline-block bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
          <h3 class="text-xl font-bold text-gray-300 mb-4">Scoring Formula</h3>
          <code class="text-2xl text-purple-400 font-mono">
            score = tokensUsed × difficultyMultiplier × qualityMultiplier
          </code>
          <p class="text-gray-500 text-sm mt-4">
            Quality bonus: +10% for detailed answers (500+ words) +10% for low repetition (&lt;30%)
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
