<script setup>
import APIDocumentation from '../components/APIDocumentation.vue'
import TokenVerification from '../components/TokenVerification.vue'
</script>

<template>
  <main class="min-h-screen bg-background text-text-primary">
    <div class="max-w-4xl mx-auto py-16 px-4">
      <div class="text-center mb-12">
        <h1 class="text-5xl font-black mb-4 tracking-tighter">DEVELOPER_DOCS</h1>
        <p class="text-text-muted font-medium">Technical specifications for high-performance token burning.</p>
      </div>
      <APIDocumentation />
      <div class="mt-12">
        <TokenVerification />
      </div>
    </div>
  </main>
</template>
