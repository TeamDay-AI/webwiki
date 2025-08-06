<template>
  <div class="h-full bg-gray-50 border-r border-gray-200 overflow-y-auto">
    <div class="p-4">
      <div class="flex items-center justify-between mb-4">
        <!-- <h2 class="text-lg font-semibold text-gray-900">Wiki</h2> -->
        <div class="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
          Read Only
        </div>
      </div>

      <!-- Breadcrumb navigation -->
      <div v-if="currentPath" class="mb-3 text-xs text-gray-500">
        <CButton
          size="xs"
          color="gray"
          variant="ghost"
          @click="currentPath = ''"
          class="px-1"
        >
          <CIcon name="i-heroicons-home" size="xs" />
        </CButton>
        <span class="mx-1">/</span>
        <span v-for="(segment, index) in pathSegments" :key="index">
          <CButton
            v-if="index < pathSegments.length - 1"
            size="xs"
            color="gray"
            variant="ghost"
            @click="navigateToPath(index)"
            class="px-1"
          >
            {{ segment }}
          </CButton>
          <span v-else class="font-medium text-gray-700">{{ segment }}</span>
          <span v-if="index < pathSegments.length - 1" class="mx-1">/</span>
        </span>
      </div>

      <div v-if="pending" class="flex justify-center py-4">
        <CIcon name="i-heroicons-arrow-path" class="animate-spin" />
      </div>

      <div
        v-else-if="!files?.files || files.files.length === 0"
        class="p-4 text-center text-gray-500 text-sm"
      >
        No files or folders found
      </div>

      <div v-else class="space-y-1">
        <div
          v-for="item in files?.files || []"
          :key="item.key"
          class="group flex items-center px-2 py-1 text-sm rounded-md hover:bg-gray-100 cursor-pointer"
          @click="handleItemClick(item)"
        >
          <CIcon
            :name="
              item.isFile ? 'i-heroicons-document-text' : 'i-heroicons-folder'
            "
            size="sm"
            class="mr-2 text-gray-500"
          />
          <span class="flex-1 truncate">{{ item.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface WikiFile {
  key: string;
  name: string;
  isFile: boolean;
  lastModified?: Date;
  size?: number;
}

const props = defineProps<{
  userId: string;
}>();

const emit = defineEmits<{
  selectFile: [path: string];
}>();

const currentPath = ref("");

const pathSegments = computed(() => {
  return currentPath.value ? currentPath.value.split("/").filter(Boolean) : [];
});

const navigateToPath = (index: number) => {
  const segments = pathSegments.value.slice(0, index + 1);
  currentPath.value = segments.join("/") + (segments.length > 0 ? "/" : "");
};

// For now, disable public navigation due to authentication requirements
const files = ref<{ files: WikiFile[]; success: boolean }>({
  files: [],
  success: false,
});
const pending = ref(false);
const refresh = () => {
  // TODO: Implement public file access or authentication for public pages
  console.warn(
    "Public file navigation is currently disabled due to authentication requirements"
  );
};

const handleItemClick = (item: WikiFile) => {
  if (item.isFile) {
    emit("selectFile", item.key);
  } else {
    // Navigate to folder
    const userPrefix = props.userId ? `users/${props.userId}/` : "";
    currentPath.value = item.key?.replace(userPrefix, "") || "";
  }
};
</script>
