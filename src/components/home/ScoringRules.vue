<script setup>
</script>

<template>
  <section class="px-4 py-8 bg-gray-100">
    <div class="max-w-7xl mx-auto">
      <div class="bg-gradient-dark border-2 border-teal-500 rounded-lg p-6 md:p-8 shadow-[0_0_30px_rgba(0,212,170,0.2)]">
        <h2 class="text-white font-bold text-xl mb-6 flex items-center gap-2">
          <span class="text-2xl">📊</span>
          Scoring Rules
        </h2>

        <div class="mb-8">
          <h3 class="text-gray-300 font-semibold mb-4 text-lg">Formula</h3>
          <div class="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <code class="code-block text-center block text-lg">
              score = tokensUsed × difficultyMultiplier × qualityMultiplier
            </code>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-gray-300 font-semibold mb-4 flex items-center gap-2">
              <span class="text-teal-400">⚡</span>
              Difficulty Multipliers
            </h3>
            <div class="bg-gray-900 rounded-xl p-5 border border-gray-700 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-gray-400">Easy</span>
                <span class="text-white font-mono bg-blue-500/20 px-3 py-1 rounded text-blue-400">
                  1.0x
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-400">Medium</span>
                <span class="text-white font-mono bg-yellow-500/20 px-3 py-1 rounded text-yellow-400">
                  1.5x
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-400">Hard</span>
                <span class="text-white font-mono bg-red-500/20 px-3 py-1 rounded text-red-400">
                  2.0x
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-gray-300 font-semibold mb-4 flex items-center gap-2">
              <span class="text-teal-400">🎯</span>
              Quality Bonuses
            </h3>
            <div class="bg-gray-900 rounded-xl p-5 border border-gray-700 space-y-3">
              <div class="flex items-start gap-3">
                <span class="text-green-400 font-bold">+10%</span>
                <span class="text-gray-400 text-sm">
                  Detailed answers<br>
                  <span class="text-gray-500">(500+ words)</span>
                </span>
              </div>
              <div class="flex items-start gap-3">
                <span class="text-green-400 font-bold">+10%</span>
                <span class="text-gray-400 text-sm">
                  Low repetition<br>
                  <span class="text-gray-500">(&lt;30%)</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 p-4 bg-teal-500/10 border border-teal-500/30 rounded-lg">
          <p class="text-gray-300 text-sm text-center">
            <span class="text-teal-400 font-bold">Tip:</span>
            Longer, thoughtful answers on harder challenges yield the highest scores!
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
