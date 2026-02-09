<template>
  <section class="export-controls" aria-label="Export leaderboard">
    <h3>Export Data</h3>
    <p>Download leaderboard data for external analysis.</p>

    <div class="button-group">
      <button
        type="button"
        class="button-primary"
        @click="$emit('export-json')"
      >
        Export JSON
      </button>

      <button
        type="button"
        class="button-secondary"
        @click="$emit('export-csv')"
      >
        Export CSV
      </button>
    </div>
  </section>
</template>

<script setup>
defineEmits(['export-json', 'export-csv'])
</script>

<style scoped>
.export-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
}

.export-controls h3 {
  margin: 0;
  font-size: 1.125rem;
  color: #374151;
}

.export-controls p {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.button-group {
  display: flex;
  gap: 0.75rem;
}

.button-primary {
  background-color: #e01b24;
  color: white;
}

.button-primary:hover:not(:disabled) {
  background-color: #c4121a;
}

.button-secondary {
  background-color: #6b7280;
  color: white;
}

.button-secondary:hover:not(:disabled) {
  background-color: #4b5563;
}

@media (max-width: 640px) {
  .export-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .button-group {
    width: 100%;
  }

  .button-group button {
    flex: 1;
  }
}
</style>
