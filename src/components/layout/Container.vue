<template>
  <div class="container">
    <slot />
  </div>
</template>

<script setup>
// Container component - provides consistent max-width and responsive padding
</script>

<style scoped>
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}
</style>
