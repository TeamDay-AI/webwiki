<template>
  <div class="h-screen flex items-center justify-center">
    <div class="text-center">
      <CIcon
        name="i-heroicons-arrow-path"
        class="animate-spin mx-auto mb-4"
        size="2xl"
      />
      <p class="text-gray-600">Loading wiki...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const userId = route.params.userId as string;

// Redirect to welcome file if it exists, or show file listing
onMounted(async () => {
  try {
    // Try to load welcome.md first
    const welcomePath = `users/${userId}/welcome.md`;
    const response = await $fetch<{ success: boolean }>(
      `/api/public/${welcomePath}`
    );

    if (response.success) {
      navigateTo(`/public/${userId}/welcome.md`);
    } else {
      // If no welcome file, redirect to main public page to show file listing
      navigateTo(`/public/${userId}/`);
    }
  } catch (error) {
    // If user doesn't exist or no files, show error or redirect
    navigateTo("/");
  }
});
</script>
