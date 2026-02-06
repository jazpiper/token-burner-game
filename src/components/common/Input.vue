<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'email', 'password', 'number', 'search'].includes(value)
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: null
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div class="input-wrapper">
    <div class="input-container" :class="{ 'has-error': error }">
      <span v-if="icon" class="input-icon">{{ icon }}</span>
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="['input-field', `input-${size}`]"
        @input="handleInput"
        @focus="emit('focus')"
        @blur="emit('blur')"
      />
    </div>
    <p v-if="error" class="input-error">{{ error }}</p>
  </div>
</template>

<style scoped>
.input-wrapper {
  width: 100%;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-container.has-error {
  border-color: #e01b24;
}

.input-container.has-error .input-field {
  border-color: #e01b24;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: #888;
  pointer-events: none;
}

.input-field {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: #00d4aa;
  box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.1);
}

.input-field:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.input-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
}

.input-md {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}

.input-lg {
  padding: 1rem 1.25rem;
  font-size: 1rem;
}

.input-field:not(:placeholder-shown) + .input-icon,
.input-field:focus + .input-icon {
  color: #00d4aa;
}

.input-error {
  color: #e01b24;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}
</style>
