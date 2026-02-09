<template>
  <section class="filter-bar" aria-label="Leaderboard filters">
    <div class="filter-group">
      <label for="difficulty-filter">Difficulty:</label>
      <select
        id="difficulty-filter"
        :value="difficulty"
        @change="$emit('update:difficulty', $event.target.value)"
      >
        <option value="">All Difficulties</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
        <option value="extreme">Extreme</option>
      </select>
    </div>

    <div class="filter-group">
      <label for="type-filter">Challenge Type:</label>
      <select
        id="type-filter"
        :value="type"
        @change="$emit('update:type', $event.target.value)"
      >
        <option value="">All Types</option>
        <option value="code">Code</option>
        <option value="analysis">Analysis</option>
        <option value="creative">Creative</option>
        <option value="reasoning">Reasoning</option>
      </select>
    </div>

    <button
      type="button"
      class="button-primary"
      @click="$emit('update')"
    >
      Apply Filters
    </button>

    <button
      v-if="difficulty || type"
      type="button"
      class="button-secondary"
      @click="clearFilters"
    >
      Clear
    </button>
  </section>
</template>

<script setup>
defineProps({
  difficulty: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:difficulty', 'update:type', 'update'])

function clearFilters() {
  emit('update:difficulty', '')
  emit('update:type', '')
  emit('update')
}
</script>

<style scoped>
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  padding: 1.5rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.filter-group select {
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: #ffffff;
  font-size: 0.875rem;
  min-width: 160px;
  cursor: pointer;
}

.filter-group select:focus {
  outline: none;
  border-color: #e01b24;
  box-shadow: 0 0 0 3px rgba(224, 27, 36, 0.1);
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
</style>
