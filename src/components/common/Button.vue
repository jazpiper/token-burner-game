<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'accent', 'outline', 'ghost'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  href: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['click'])

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
}

const variantClasses = {
  primary: 'bg-gradient-burn text-white hover:shadow-[0_0_20px_rgba(224,27,36,0.5)]',
  secondary: 'bg-teal-500 text-white hover:bg-teal-600 hover:shadow-[0_0_20px_rgba(0,212,170,0.5)]',
  accent: 'bg-yellow-400 text-gray-900 hover:bg-yellow-500 hover:shadow-[0_0_20px_rgba(255,215,0,0.5)]',
  outline: 'border-2 border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white',
  ghost: 'text-gray-700 hover:bg-gray-100'
}

const baseClasses = 'font-bold rounded-lg transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    v-bind="href ? { href } : { type: 'button' }"
    :disabled="disabled || loading"
    :class="[
      baseClasses,
      sizeClasses[size],
      variantClasses[variant],
      fullWidth ? 'w-full' : '',
      !disabled && !loading ? 'button-hover' : ''
    ]"
    @click="handleClick"
  >
    <span v-if="loading" class="animate-spin">⟳</span>
    <slot></slot>
  </component>
</template>
