<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Welcome to Wiki</h1>
      <p class="text-xl text-gray-600 mb-8">
        A simple markdown-based wiki system
      </p>
      <UButton size="lg" @click="navigateTo('/wiki')">
        Get Started
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
// Auto-redirect to wiki if user is already authenticated
const { user } = useAuth()

watch(user, (newUser) => {
  if (newUser) {
    navigateTo('/wiki')
  }
}, { immediate: true })
</script>