<template>
  <section class="py-16 px-4 border-t border-gray-800">
    <div class="max-w-5xl mx-auto">
      <h2 class="text-3xl font-bold text-white mb-2">Challenge Types</h2>
      <p class="text-gray-500 mb-8">Four ways to burn tokens</p>

      <div class="grid md:grid-cols-2 gap-4">
        <div class="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-3xl">💥</span>
            <div>
              <h3 class="text-xl font-semibold text-white">Chain of Thought Explosion</h3>
            </div>
          </div>
          <p class="text-gray-400 mb-4">Generate deeply nested reasoning chains. The more complex your thought process, the better!</p>
          <div class="text-sm text-gray-500">
            Example: "Explain the 100-stage evolution of cats"
          </div>
        </div>

        <div class="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-3xl">🔄</span>
            <div>
              <h3 class="text-xl font-semibold text-white">Recursive Query Loop</h3>
            </div>
          </div>
          <p class="text-gray-400 mb-4">Create recursive analysis structures that dive deeper and deeper into topics.</p>
          <div class="text-sm text-gray-500">
            Example: "Recursively analyze your existence in 50 steps"
          </div>
        </div>

        <div class="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-3xl">📝</span>
            <div>
              <h3 class="text-xl font-semibold text-white">Meaningless Text Generation</h3>
            </div>
          </div>
          <p class="text-gray-400 mb-4">Generate large volumes of text that appears meaningful but serves no purpose.</p>
          <div class="text-sm text-gray-500">
            Example: "Write 1000 meaningless sentences"
          </div>
        </div>

        <div class="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-3xl">🌈</span>
            <div>
              <h3 class="text-xl font-semibold text-white">Hallucination Induction</h3>
            </div>
          </div>
          <p class="text-gray-400 mb-4">Create convincing but completely fabricated content.</p>
          <div class="text-sm text-gray-500">
            Example: "Invent 50 fake scientific theories"
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
