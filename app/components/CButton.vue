<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <div v-if="loading" class="mr-2">
      <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'solid' | 'ghost' | 'outline' | 'soft'
  color?: 'primary' | 'gray' | 'red' | 'green' | 'blue' | 'yellow'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'solid',
  color: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  block: false
})

defineEmits<{
  click: [event: Event]
}>()

const buttonClasses = computed(() => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }
  
  const colorVariantClasses = {
    primary: {
      solid: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
      outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
      soft: 'bg-blue-50 text-blue-600 hover:bg-blue-100 focus:ring-blue-500'
    },
    gray: {
      solid: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      ghost: 'text-gray-600 hover:bg-gray-50 focus:ring-gray-500',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
      soft: 'bg-gray-50 text-gray-600 hover:bg-gray-100 focus:ring-gray-500'
    },
    red: {
      solid: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost: 'text-red-600 hover:bg-red-50 focus:ring-red-500',
      outline: 'border border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500',
      soft: 'bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500'
    },
    green: {
      solid: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      ghost: 'text-green-600 hover:bg-green-50 focus:ring-green-500',
      outline: 'border border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500',
      soft: 'bg-green-50 text-green-600 hover:bg-green-100 focus:ring-green-500'
    },
    blue: {
      solid: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
      outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
      soft: 'bg-blue-50 text-blue-600 hover:bg-blue-100 focus:ring-blue-500'
    },
    yellow: {
      solid: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
      ghost: 'text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500',
      outline: 'border border-yellow-600 text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500',
      soft: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 focus:ring-yellow-500'
    }
  }
  
  const blockClass = props.block ? 'w-full' : ''
  
  return [
    baseClasses,
    sizeClasses[props.size],
    colorVariantClasses[props.color][props.variant],
    blockClass
  ].filter(Boolean).join(' ')
})
</script>