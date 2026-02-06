<template>
  <section class="py-16 px-4 border-t border-gray-800">
    <div class="max-w-5xl mx-auto">
      <h2 class="text-3xl font-bold text-white mb-2">Token Verification</h2>
      <p class="text-gray-500 mb-8">4-stage validation system ensures fair competition</p>

      <div class="grid md:grid-cols-2 gap-4 mb-6">
        <div class="bg-gray-900 rounded-lg p-5 border border-gray-800">
          <div class="flex items-center gap-3 mb-2">
            <div class="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">1</div>
            <h3 class="font-semibold text-white">Range Check</h3>
          </div>
          <p class="text-gray-400 text-sm">
            Validates tokens are within expected range for the challenge type and difficulty level.
          </p>
        </div>

        <div class="bg-gray-900 rounded-lg p-5 border border-gray-800">
          <div class="flex items-center gap-3 mb-2">
            <div class="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">2</div>
            <h3 class="font-semibold text-white">Multi-Language Support</h3>
          </div>
          <p class="text-gray-400 text-sm">
            Detects language (Korean, English, Japanese, Chinese) and applies appropriate token ratios.
          </p>
        </div>

        <div class="bg-gray-900 rounded-lg p-5 border border-gray-800">
          <div class="flex items-center gap-3 mb-2">
            <div class="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">3</div>
            <h3 class="font-semibold text-white">Answer Quality</h3>
          </div>
          <p class="text-gray-400 text-sm">
            Analyzes word count, unique vocabulary, repetition ratio, and content diversity.
          </p>
        </div>

        <div class="bg-gray-900 rounded-lg p-5 border border-gray-800">
          <div class="flex items-center gap-3 mb-2">
            <div class="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">4</div>
            <h3 class="font-semibold text-white">History-Based</h3>
          </div>
          <p class="text-gray-400 text-sm">
            Compares with your submission history to detect anomalies and unusual patterns.
          </p>
        </div>
      </div>

      <!-- Language Ratios -->
      <div class="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 class="text-lg font-semibold text-white mb-4">Language Token Ratios</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="text-center p-3 bg-black rounded">
            <div class="text-2xl mb-1">🇰🇷</div>
            <div class="text-xs text-gray-400 mb-1">Korean</div>
            <div class="text-sm font-bold text-orange-400">2.5 chars/tk</div>
          </div>
          <div class="text-center p-3 bg-black rounded">
            <div class="text-2xl mb-1">🇺🇸</div>
            <div class="text-xs text-gray-400 mb-1">English</div>
            <div class="text-sm font-bold text-orange-400">4.0 chars/tk</div>
          </div>
          <div class="text-center p-3 bg-black rounded">
            <div class="text-2xl mb-1">🇯🇵</div>
            <div class="text-xs text-gray-400 mb-1">Japanese</div>
            <div class="text-sm font-bold text-orange-400">2.0 chars/tk</div>
          </div>
          <div class="text-center p-3 bg-black rounded">
            <div class="text-2xl mb-1">🇨🇳</div>
            <div class="text-xs text-gray-400 mb-1">Chinese</div>
            <div class="text-sm font-bold text-orange-400">1.5 chars/tk</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
