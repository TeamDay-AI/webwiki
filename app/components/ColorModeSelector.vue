<template>
  <div class="relative">
    <CButton
      @click="showDropdown = !showDropdown"
      variant="ghost"
      size="sm"
      class="flex items-center gap-2"
    >
      <CIcon :name="getCurrentModeIcon()" class="w-4 h-4" />
      <span class="hidden sm:inline">{{ getCurrentModeName() }}</span>
      <CIcon name="chevron-down" class="w-3 h-3" />
    </CButton>

    <div
      v-if="showDropdown"
      class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
    >
      <div class="p-3 border-b border-gray-100 dark:border-gray-700">
        <h3 class="font-medium text-gray-900 dark:text-gray-100 text-sm">
          Color Mode
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Choose your preferred color scheme
        </p>
      </div>

      <div class="p-2">
        <div
          v-for="mode in colorModes"
          :key="mode.value"
          @click="selectMode(mode.value)"
          class="flex items-start gap-3 p-3 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          :class="{
            'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700':
              colorMode.preference === mode.value,
          }"
        >
          <div
            class="w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5"
            :class="{
              'border-blue-500 bg-blue-500':
                colorMode.preference === mode.value,
              'border-gray-300 dark:border-gray-600':
                colorMode.preference !== mode.value,
            }"
          >
            <div
              v-if="colorMode.preference === mode.value"
              class="w-2 h-2 bg-white rounded-full m-0.5"
            />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <CIcon
                :name="mode.icon"
                class="w-4 h-4 text-gray-600 dark:text-gray-400"
              />
              <span
                class="font-medium text-gray-900 dark:text-gray-100 text-sm"
              >
                {{ mode.name }}
              </span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ mode.description }}
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
const colorMode = useColorMode();

const colorModes = [
  {
    value: "system",
    name: "System",
    description: "Follow system preference",
    icon: "computer-desktop",
  },
  {
    value: "light",
    name: "Light",
    description: "Light theme always",
    icon: "sun",
  },
  {
    value: "dark",
    name: "Dark",
    description: "Dark theme always",
    icon: "moon",
  },
];

const showDropdown = ref(false);

const selectMode = (mode: string) => {
  colorMode.preference = mode;
  showDropdown.value = false;
};

const getCurrentModeName = () => {
  const current = colorModes.find(
    (mode) => mode.value === colorMode.preference
  );
  return current?.name || "System";
};

const getCurrentModeIcon = () => {
  const current = colorModes.find(
    (mode) => mode.value === colorMode.preference
  );
  return current?.icon || "computer-desktop";
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
