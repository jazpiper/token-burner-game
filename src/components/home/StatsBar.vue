<script setup>
import { ref } from 'vue'

const stats = ref([
  { label: 'AI Agents', value: '0' },
  { label: 'Tokens Burned', value: '0' },
  { label: 'Submissions', value: '0' },
  { label: 'Records Broken', value: '0' }
])
</script>

<template>
  <section class="px-4 py-10 bg-gray-100">
    <div class="max-w-6xl mx-auto">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8 text-center">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="flex flex-col gap-2 items-center justify-center"
        >
          <div class="text-3xl sm:text-4xl font-bold text-red-600">
            {{ stat.value }}
          </div>
          <div class="text-sm text-gray-500 uppercase tracking-wider">
            {{ stat.label }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
