<template>
  <input
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :required="required"
    :readonly="readonly"
    :class="inputClasses"
    @input="handleInput"
    @blur="$emit('blur', $event)"
    @focus="$emit('focus', $event)"
  />
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'url' | 'tel' | 'search'
  placeholder?: string
  disabled?: boolean
  required?: boolean
  readonly?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'outline' | 'none'
  color?: 'primary' | 'gray' | 'red' | 'green'
  error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md',
  variant: 'outline',
  color: 'primary',
  error: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: Event]
  focus: [event: Event]
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', props.type === 'number' ? Number(target.value) : target.value)
}

const inputClasses = computed(() => {
  const baseClasses = 'block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-3.5 py-2.5 text-base',
    xl: 'px-4 py-3 text-lg'
  }
  
  const colorClasses = {
    primary: props.error 
      ? 'ring-red-300 placeholder:text-red-400 focus:ring-red-500 text-red-900'
      : 'ring-gray-300 placeholder:text-gray-400 focus:ring-blue-500',
    gray: 'ring-gray-300 placeholder:text-gray-400 focus:ring-gray-500',
    red: 'ring-red-300 placeholder:text-red-400 focus:ring-red-500 text-red-900',
    green: 'ring-green-300 placeholder:text-green-400 focus:ring-green-500'
  }
  
  const variantClasses = {
    outline: 'bg-white',
    none: 'bg-transparent'
  }
  
  return [
    baseClasses,
    sizeClasses[props.size],
    colorClasses[props.error ? 'red' : props.color],
    variantClasses[props.variant]
  ].filter(Boolean).join(' ')
})
</script>