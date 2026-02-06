<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'secondary', 'success', 'danger', 'warning'].includes(value)
  },
  padding: {
    type: String,
    default: 'md',
    validator: (value) => ['none', 'sm', 'md', 'lg'].includes(value)
  },
  rounded: {
    type: String,
    default: 'md',
    validator: (value) => ['none', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  hoverable: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const paddingClasses = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
}

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl'
}

const variantClasses = {
  default: 'bg-white border border-gray-200',
  primary: 'bg-gray-900 text-white',
  secondary: 'bg-gray-100',
  success: 'bg-green-50 border-green-200',
  danger: 'bg-red-50 border-red-200',
  warning: 'bg-yellow-50 border-yellow-200'
}
</script>

<template>
  <div
    :class="[
      'card transition-all duration-200',
      paddingClasses[padding],
      roundedClasses[rounded],
      variantClasses[variant],
      hoverable ? 'card-hover cursor-pointer' : '',
      clickable ? 'cursor-pointer active:scale-95' : ''
    ]"
    @click="clickable ? emit('click') : null"
  >
    <slot></slot>
  </div>
</template>

<style scoped>
.card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
