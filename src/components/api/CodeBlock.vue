<template>
  <div class="code-block">
    <pre><code>{{ code }}</code></pre>
  </div>
</template>

<script setup>
defineProps({
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'json'
  }
})
</script>

<style scoped>
.code-block {
  margin: 0.5rem 0;
  border-radius: 0.5rem;
  overflow: hidden;
}

pre {
  margin: 0;
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.5;
}

code {
  font-family: 'Monaco', 'Courier New', monospace;
  background: transparent;
  color: inherit;
  padding: 0;
}
</style>
