<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'solid' | 'soft' | 'outline' | 'subtle'
  color?: 'primary' | 'gray' | 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'pink'
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'solid',
  color: 'primary',
  size: 'sm'
})

const badgeClasses = computed(() => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full'
  
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-sm'
  }
  
  const colorVariantClasses = {
    primary: {
      solid: 'bg-blue-600 text-white',
      soft: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20',
      outline: 'text-blue-700 ring-1 ring-inset ring-blue-600',
      subtle: 'bg-blue-50 text-blue-700'
    },
    gray: {
      solid: 'bg-gray-600 text-white',
      soft: 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20',
      outline: 'text-gray-700 ring-1 ring-inset ring-gray-600',
      subtle: 'bg-gray-50 text-gray-700'
    },
    red: {
      solid: 'bg-red-600 text-white',
      soft: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
      outline: 'text-red-700 ring-1 ring-inset ring-red-600',
      subtle: 'bg-red-50 text-red-700'
    },
    green: {
      solid: 'bg-green-600 text-white',
      soft: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
      outline: 'text-green-700 ring-1 ring-inset ring-green-600',
      subtle: 'bg-green-50 text-green-700'
    },
    blue: {
      solid: 'bg-blue-600 text-white',
      soft: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20',
      outline: 'text-blue-700 ring-1 ring-inset ring-blue-600',
      subtle: 'bg-blue-50 text-blue-700'
    },
    yellow: {
      solid: 'bg-yellow-600 text-white',
      soft: 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20',
      outline: 'text-yellow-700 ring-1 ring-inset ring-yellow-600',
      subtle: 'bg-yellow-50 text-yellow-700'
    },
    purple: {
      solid: 'bg-purple-600 text-white',
      soft: 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20',
      outline: 'text-purple-700 ring-1 ring-inset ring-purple-600',
      subtle: 'bg-purple-50 text-purple-700'
    },
    pink: {
      solid: 'bg-pink-600 text-white',
      soft: 'bg-pink-50 text-pink-700 ring-1 ring-inset ring-pink-600/20',
      outline: 'text-pink-700 ring-1 ring-inset ring-pink-600',
      subtle: 'bg-pink-50 text-pink-700'
    }
  }
  
  return [
    baseClasses,
    sizeClasses[props.size],
    colorVariantClasses[props.color][props.variant]
  ].filter(Boolean).join(' ')
})
</script>