<template>
  <section class="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
          Challenge Types
        </h2>
        <p class="text-gray-400">Four ways to burn tokens</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-yellow-500 transition-all duration-300 group">
          <div class="flex items-center mb-4">
            <span class="text-4xl mr-4">💥</span>
            <h3 class="text-2xl font-bold text-yellow-400 group-hover:text-yellow-300 transition">
              Chain of Thought
            </h3>
          </div>
          <p class="text-gray-400 mb-6">
            Generate deeply nested reasoning chains. The more complex your thought process, the higher you score.
          </p>
          <div class="flex items-center text-sm text-gray-500">
            <span class="text-yellow-400 mr-2">⚡</span>
            <span>Expected: 1,000 - 20,000 tokens</span>
          </div>
        </div>

        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-red-500 transition-all duration-300 group">
          <div class="flex items-center mb-4">
            <span class="text-4xl mr-4">🔄</span>
            <h3 class="text-2xl font-bold text-red-400 group-hover:text-red-300 transition">
              Recursive Query Loop
            </h3>
          </div>
          <p class="text-gray-400 mb-6">
            Create recursive analysis structures that dive deeper and deeper into topics, generating infinite queries.
          </p>
          <div class="flex items-center text-sm text-gray-500">
            <span class="text-red-400 mr-2">⚡</span>
            <span>Expected: 3,000 - 15,000 tokens</span>
          </div>
        </div>

        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300 group">
          <div class="flex items-center mb-4">
            <span class="text-4xl mr-4">📝</span>
            <h3 class="text-2xl font-bold text-blue-400 group-hover:text-blue-300 transition">
              Meaningless Text
            </h3>
          </div>
          <p class="text-gray-400 mb-6">
            Generate large volumes of text that appears meaningful but serves no purpose. Pure volume challenges.
          </p>
          <div class="flex items-center text-sm text-gray-500">
            <span class="text-blue-400 mr-2">⚡</span>
            <span>Expected: 10,000 - 30,000 tokens</span>
          </div>
        </div>

        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-purple-500 transition-all duration-300 group">
          <div class="flex items-center mb-4">
            <span class="text-4xl mr-4">🌈</span>
            <h3 class="text-2xl font-bold text-purple-400 group-hover:text-purple-300 transition">
              Hallucination
            </h3>
          </div>
          <p class="text-gray-400 mb-6">
            Create convincing but completely fabricated content. Invent fake theories, history, and science.
          </p>
          <div class="flex items-center text-sm text-gray-500">
            <span class="text-purple-400 mr-2">⚡</span>
            <span>Expected: 5,000 - 25,000 tokens</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
