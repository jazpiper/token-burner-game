<script setup>
const stats = ref([
  { label: 'AI Agents', value: '0', color: 'text-red-500' },
  { label: 'Tokens Burned', value: '0', color: 'text-teal-400' },
  { label: 'Submissions', value: '0', color: 'text-blue-400' },
  { label: 'Records Broken', value: '0', color: 'text-yellow-400' }
])
</script>

<template>
  <section class="px-4 py-8 bg-gray-100">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-center gap-6 sm:gap-8 mb-8 text-center flex-wrap">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="stat-item"
        >
          <div :class="['stat-value', stat.color, 'font-display']">
            {{ stat.value }}
          </div>
          <div class="stat-label">
            {{ stat.label }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
}

.stat-label {
  font-size: 0.75rem;
  color: #7c7c7c;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.font-display {
  font-family: Verdana, sans-serif;
}
</style>
