<template>
  <section class="py-20 px-4 bg-gradient-to-b from-gray-900 to-black">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Token Verification
        </h2>
        <p class="text-gray-400">4-stage validation system ensures fair competition</p>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-green-500 transition-all duration-300">
          <div class="flex items-center mb-4">
            <div class="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4 text-lg">1</div>
            <h3 class="text-xl font-bold text-green-400">Range Check</h3>
          </div>
          <p class="text-gray-400">
            Validates tokens are within expected range for the challenge type and difficulty level.
          </p>
        </div>

        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300">
          <div class="flex items-center mb-4">
            <div class="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4 text-lg">2</div>
            <h3 class="text-xl font-bold text-blue-400">Multi-Language Support</h3>
          </div>
          <p class="text-gray-400">
            Detects language (Korean, English, Japanese, Chinese) and applies appropriate token ratios.
          </p>
        </div>

        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-purple-500 transition-all duration-300">
          <div class="flex items-center mb-4">
            <div class="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4 text-lg">3</div>
            <h3 class="text-xl font-bold text-purple-400">Answer Quality</h3>
          </div>
          <p class="text-gray-400">
            Analyzes word count, unique vocabulary, repetition ratio, and content diversity.
          </p>
        </div>

        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-pink-500 transition-all duration-300">
          <div class="flex items-center mb-4">
            <div class="bg-pink-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4 text-lg">4</div>
            <h3 class="text-xl font-bold text-pink-400">History-Based</h3>
          </div>
          <p class="text-gray-400">
            Compares with your submission history to detect anomalies and unusual patterns.
          </p>
        </div>
      </div>

      <!-- Language Ratios -->
      <div class="mt-12 bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
        <h3 class="text-xl font-bold text-center mb-6 text-gray-300">Language Token Ratios</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 bg-gray-900/50 rounded-lg">
            <div class="text-2xl mb-2">🇰🇷</div>
            <div class="text-sm text-gray-400">Korean</div>
            <div class="text-lg font-bold text-green-400">2.5 chars/token</div>
          </div>
          <div class="text-center p-4 bg-gray-900/50 rounded-lg">
            <div class="text-2xl mb-2">🇺🇸</div>
            <div class="text-sm text-gray-400">English</div>
            <div class="text-lg font-bold text-blue-400">4.0 chars/token</div>
          </div>
          <div class="text-center p-4 bg-gray-900/50 rounded-lg">
            <div class="text-2xl mb-2">🇯🇵</div>
            <div class="text-sm text-gray-400">Japanese</div>
            <div class="text-lg font-bold text-red-400">2.0 chars/token</div>
          </div>
          <div class="text-center p-4 bg-gray-900/50 rounded-lg">
            <div class="text-2xl mb-2">🇨🇳</div>
            <div class="text-sm text-gray-400">Chinese</div>
            <div class="text-lg font-bold text-yellow-400">1.5 chars/token</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
