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
      <div
        v-if="cleanPathSegments.length > 0"
        class="mb-3 text-xs text-gray-500"
      >
        <CButton
          size="xs"
          color="gray"
          variant="ghost"
          @click="navigateTo(`/public/${props.userId}`)"
          class="px-1"
        >
          <CIcon name="i-heroicons-home" size="xs" />
        </CButton>
        <span class="mx-1">/</span>
        <span v-for="(segment, index) in cleanPathSegments" :key="index">
          <CButton
            v-if="index < cleanPathSegments.length - 1"
            size="xs"
            color="gray"
            variant="ghost"
            @click="navigateToCleanPath(index)"
            class="px-1"
          >
            {{ segment }}
          </CButton>
          <span v-else class="font-medium text-gray-700">{{ segment }}</span>
          <span v-if="index < cleanPathSegments.length - 1" class="mx-1"
            >/</span
          >
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

interface PublicApiResponse {
  success: boolean;
  type: "directory" | "file";
  files?: WikiFile[];
  content?: string;
  lastModified?: Date;
  path?: string;
}

const props = defineProps<{
  userId: string;
}>();

const emit = defineEmits<{
  selectFile: [path: string];
}>();

const route = useRoute();

// Sync currentPath with route to avoid unnecessary navigation refreshes
const currentPath = computed(() => {
  const pathParam = route.params.path;
  if (Array.isArray(pathParam)) {
    const fullPath = pathParam.join("/");
    // Extract directory path from file path
    const lastSlashIndex = fullPath.lastIndexOf("/");
    // For root-level files, return empty string to show root directory
    return lastSlashIndex > 0 ? fullPath.substring(0, lastSlashIndex) : "";
  }
  // For directory paths or empty, return the path or empty string for root
  return pathParam ? (typeof pathParam === "string" ? pathParam : "") : "";
});

const pathSegments = computed(() => {
  return currentPath.value ? currentPath.value.split("/").filter(Boolean) : [];
});

// Clean path segments that hide internal structure
const cleanPathSegments = computed(() => {
  const segments = pathSegments.value;
  // Remove users/userId from the beginning of the path segments
  if (
    segments.length >= 2 &&
    segments[0] === "users" &&
    segments[1] === props.userId
  ) {
    return segments.slice(2); // Remove 'users' and userId
  }
  return segments;
});

const navigateToCleanPath = (index: number) => {
  const segments = cleanPathSegments.value.slice(0, index + 1);
  const newPath = segments.join("/");
  navigateTo(`/public/${props.userId}/${newPath}`);
};

// Cache for directory listings to avoid unnecessary API calls
const directoryCache = new Map<
  string,
  { files: WikiFile[]; timestamp: number }
>();
const CACHE_DURATION = 30000; // 30 seconds

const files = ref<{ files: WikiFile[]; success: boolean }>({
  files: [],
  success: false,
});
const pending = ref(false);

const refresh = async (forceRefresh = false) => {
  if (!props.userId) return;

  const cacheKey = `${props.userId}/${currentPath.value}`;

  // Check cache first unless force refresh
  if (!forceRefresh) {
    const cached = directoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      files.value = { files: cached.files, success: true };
      return;
    }
  }

  pending.value = true;
  try {
    const userPath = `users/${props.userId}/${currentPath.value}`;
    const response = (await $fetch(
      `/api/public/${userPath}`
    )) as PublicApiResponse;

    if (response.success && response.type === "directory" && response.files) {
      const filesData = response.files || [];
      files.value = {
        files: filesData,
        success: true,
      };

      // Cache the result
      directoryCache.set(cacheKey, {
        files: filesData,
        timestamp: Date.now(),
      });
    } else {
      files.value = { files: [], success: false };
    }
  } catch (error) {
    console.error("Failed to load directory:", error);
    files.value = { files: [], success: false };
  } finally {
    pending.value = false;
  }
};

const handleItemClick = (item: WikiFile) => {
  if (item.isFile) {
    emit("selectFile", item.key);
  } else {
    // Navigate to folder
    const userPrefix = props.userId ? `users/${props.userId}/` : "";
    const folderPath = item.key?.replace(userPrefix, "") || "";
    navigateTo(`/public/${props.userId}/${folderPath}`);
  }
};

// Watch for path changes and refresh directory listing only when directory changes
let lastDirectoryPath: string | null = null; // Use null to distinguish from empty string
watch(
  [currentPath, () => props.userId],
  ([newPath, newUserId]) => {
    if (
      newUserId &&
      (newPath !== lastDirectoryPath || lastDirectoryPath === null)
    ) {
      lastDirectoryPath = newPath;
      refresh();
    }
  },
  { immediate: true }
);
</script>
