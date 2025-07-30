<template>
  <Icon :name="name" :class="iconClasses" />
</template>

<script setup lang="ts">
interface Props {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const iconClasses = computed(() => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10'
  }
  
  const colorClass = props.color ? `text-${props.color}` : ''
  
  return [
    sizeClasses[props.size],
    colorClass
  ].filter(Boolean).join(' ')
})
</script>