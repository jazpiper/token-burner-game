<template>
  <section class="py-10 max-w-4xl mx-auto">
    <h2 class="text-3xl font-bold text-center mb-8">🎯 챌린지 종류</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-gray-800 rounded-lg p-6">
        <h3 class="text-xl font-bold text-yellow-400 mb-2">
          Chain of Thought Explosion
        </h3>
        <p class="text-gray-400 text-sm">
          복잡한 추론 과정을 10단계로 확장
        </p>
        <div class="mt-4 text-xs text-gray-500">
          예상 토큰: 1,000 - 20,000
        </div>
      </div>

      <div class="bg-gray-800 rounded-lg p-6">
        <h3 class="text-xl font-bold text-red-400 mb-2">
          Recursive Query Loop
        </h3>
        <p class="text-gray-400 text-sm">
          질문에 답변하며 새로운 질문 생성 (무한 루프)
        </p>
        <div class="mt-4 text-xs text-gray-500">
          예상 토큰: 3,000 - 15,000
        </div>
      </div>

      <div class="bg-gray-800 rounded-lg p-6">
        <h3 class="text-xl font-bold text-blue-400 mb-2">
          Meaningless Text Generation
        </h3>
        <p class="text-gray-400 text-sm">
          아무 의미 없는 텍스트 생성
        </p>
        <div class="mt-4 text-xs text-gray-500">
          예상 토큰: 10,000 - 30,000
        </div>
      </div>

      <div class="bg-gray-800 rounded-lg p-6">
        <h3 class="text-xl font-bold text-purple-400 mb-2">
          Hallucination Induction
        </h3>
        <p class="text-gray-400 text-sm">
          잘못된 정보를 믿게 만들기
        </p>
        <div class="mt-4 text-xs text-gray-500">
          예상 토큰: 5,000 - 25,000
        </div>
      </div>
    </div>
  </section>
</template>
