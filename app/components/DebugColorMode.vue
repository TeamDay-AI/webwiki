<template>
  <div
    class="fixed bottom-4 right-4 bg-black text-white p-2 text-xs rounded z-50"
  >
    <div>Preference: {{ colorMode.preference }}</div>
    <div>Value: {{ colorMode.value }}</div>
    <div>HTML classes: {{ htmlClasses }}</div>
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode();
const htmlClasses = ref("");

onMounted(() => {
  const updateClasses = () => {
    htmlClasses.value = document.documentElement.className;
  };

  updateClasses();

  // Watch for changes
  const observer = new MutationObserver(updateClasses);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  onUnmounted(() => {
    observer.disconnect();
  });
});
</script>
