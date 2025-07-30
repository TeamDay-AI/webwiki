<template>
  <form :class="formClasses" @submit="handleSubmit">
    <slot />
  </form>
</template>

<script setup lang="ts">
interface Props {
  state?: Record<string, any>
  schema?: any
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  spacing: 'md'
})

const emit = defineEmits<{
  submit: [data: Record<string, any>]
}>()

const handleSubmit = (event: Event) => {
  event.preventDefault()
  
  const formData = new FormData(event.target as HTMLFormElement)
  const data: Record<string, any> = {}
  
  for (const [key, value] of formData.entries()) {
    data[key] = value
  }
  
  // Use state if provided, otherwise use form data
  emit('submit', props.state || data)
}

const formClasses = computed(() => {
  const spacingClasses = {
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8'
  }
  
  return spacingClasses[props.spacing]
})
</script>