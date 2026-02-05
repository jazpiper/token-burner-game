<script setup>
import APIDocumentation from '../components/APIDocumentation.vue'
import TokenVerification from '../components/TokenVerification.vue'
</script>

<template>
  <main class="min-h-screen bg-gray-900 text-white">
    <div class="max-w-4xl mx-auto py-10">
      <h1 class="text-4xl font-bold mb-8 text-center">📚 API 문서</h1>
      <APIDocumentation />
      <TokenVerification />
    </div>
  </main>
</template>
