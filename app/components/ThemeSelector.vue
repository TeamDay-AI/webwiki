<template>
  <div class="relative">
    <CButton
      @click="showDropdown = !showDropdown"
      variant="ghost"
      size="sm"
      class="flex items-center gap-2"
    >
      <CIcon name="document-text" class="w-4 h-4" />
      <span class="hidden sm:inline">{{ getCurrentTheme().name }}</span>
      <CIcon name="chevron-down" class="w-3 h-3" />
    </CButton>

    <div
      v-if="showDropdown"
      class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
    >
      <div class="p-3 border-b border-gray-100 dark:border-gray-700">
        <h3 class="font-medium text-gray-900 dark:text-gray-100 text-sm">
          Typography Theme
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Choose your preferred reading style
        </p>
      </div>

      <div class="p-2">
        <div
          v-for="theme in themes"
          :key="theme.id"
          @click="selectTheme(theme.id)"
          class="flex items-start gap-3 p-3 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          :class="{
            'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700':
              currentTheme === theme.id,
          }"
        >
          <div
            class="w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5"
            :class="{
              'border-blue-500 bg-blue-500': currentTheme === theme.id,
              'border-gray-300 dark:border-gray-600': currentTheme !== theme.id,
            }"
          >
            <div
              v-if="currentTheme === theme.id"
              class="w-2 h-2 bg-white rounded-full m-0.5"
            />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span
                class="font-medium text-gray-900 dark:text-gray-100 text-sm"
              >
                {{ theme.name }}
              </span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ theme.description }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop to close dropdown -->
    <div
      v-if="showDropdown"
      @click="showDropdown = false"
      class="fixed inset-0 z-40"
    />
  </div>
</template>

<script setup lang="ts">
const { themes, currentTheme, setTheme, getCurrentTheme } = useTheme();
const showDropdown = ref(false);

const selectTheme = (themeId: string) => {
  setTheme(themeId);
  showDropdown.value = false;
};

// Close dropdown when clicking outside
onMounted(() => {
  const handleClickOutside = (event: Event) => {
    const target = event.target as Element;
    if (!target.closest(".relative")) {
      showDropdown.value = false;
    }
  };

  document.addEventListener("click", handleClickOutside);

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
  });
});
</script>
