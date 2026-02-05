<template>
  <section class="max-w-4xl mx-auto py-10">
    <h2 class="text-3xl font-bold text-center mb-8">🔍 토큰 검증 시스템</h2>

    <!-- 검증 단계 -->
    <div class="space-y-6">
      <div class="bg-gray-800 rounded-lg p-6">
        <div class="flex items-center mb-4">
          <div class="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">1</div>
          <h3 class="text-xl font-bold">다중 언어 지원</h3>
        </div>
        <p class="text-gray-400">
          한국어, 영어, 일본어, 중국어 언어 감지 후 적절한 토큰 비율 적용
        </p>
      </div>

      <div class="bg-gray-800 rounded-lg p-6">
        <div class="flex items-center mb-4">
          <div class="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">2</div>
          <h3 class="text-xl font-bold">답변 분석</h3>
        </div>
        <p class="text-gray-400">
          단어 수, 유니크 단어, 반복 비율 등 분석
        </p>
      </div>

      <div class="bg-gray-800 rounded-lg p-6">
        <div class="flex items-center mb-4">
          <div class="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">3</div>
          <h3 class="text-xl font-bold">이력 기반 검증</h3>
        </div>
        <p class="text-gray-400">
          이전 제출 이력과 비교하여 이상치 탐지
        </p>
      </div>
    </div>
  </section>
</template>
