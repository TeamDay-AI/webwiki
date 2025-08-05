<template>
  <div>
    <CApp>
      <NuxtPage />
    </CApp>
    <DebugColorMode />
  </div>
</template>

<script setup lang="ts">
// Initialize theme system
useTheme();

// Initialize color mode
const colorMode = useColorMode();

// Debug color mode
if (process.client) {
  console.log("Color mode preference:", colorMode.preference);
  console.log("Color mode value:", colorMode.value);
}
</script>
