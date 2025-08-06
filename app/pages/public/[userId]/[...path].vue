<template>
  <div class="h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center space-x-2">
        <h1 class="text-2xl font-bold text-gray-900">Wiki</h1>
        <div v-if="currentPath" class="flex items-center text-sm text-gray-500">
          <span class="mx-2">/</span>
          <div class="flex items-center space-x-1">
            <span
              v-for="(segment, index) in pathSegments"
              :key="index"
              class="flex items-center"
            >
              <CButton
                v-if="index < pathSegments.length - 1"
                size="xs"
                color="gray"
                variant="ghost"
                @click="navigateToSegment(index)"
                class="px-2 py-1 hover:bg-gray-100"
              >
                {{ segment }}
              </CButton>
              <span v-else class="font-medium text-gray-700 px-2">{{
                segment
              }}</span>
              <span
                v-if="index < pathSegments.length - 1"
                class="mx-1 text-gray-400"
                >/</span
              >
            </span>
          </div>
        </div>
        <div
          class="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
        >
          Public View
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Panel - Navigation -->
      <div class="w-64 flex-shrink-0">
        <PublicNavigation :user-id="userId" @select-file="handleFileSelect" />
      </div>

      <!-- Center Panel - Content -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="pending" class="flex justify-center py-8">
          <CIcon name="i-heroicons-arrow-path" class="animate-spin" size="lg" />
        </div>
        <div v-else-if="error" class="text-center py-8 text-red-600 p-4">
          <p>{{ error }}</p>
        </div>
        <div
          v-else-if="currentContent"
          class="flex-1 p-4 overflow-y-auto prose bg-white dark:bg-gray-900"
        >
          <div v-html="renderedContent" />
        </div>
        <div v-else class="text-center py-8 text-gray-500 p-4">
          <CIcon
            name="i-heroicons-document-text"
            size="2xl"
            class="mx-auto mb-4 text-gray-300"
          />
          <p>Select a file to view its content</p>
        </div>
      </div>

      <!-- Right Panel - Table of Contents -->
      <div class="w-64 flex-shrink-0">
        <TableOfContents :content="currentContent" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from "marked";

// Initialize theme system for proper typography
const { setTheme } = useTheme();
// Set default theme on mount
onMounted(() => {
  setTheme("default");
});
interface PublicApiResponse {
  success: boolean;
  type: "directory" | "file";
  files?: Array<{
    key: string;
    name: string;
    isFile: boolean;
    lastModified?: Date;
    size?: number;
  }>;
  content?: string;
  lastModified?: Date;
  path?: string;
}

const route = useRoute();

// Extract userId and path from route params
const userId = computed(() => route.params.userId as string);
const currentPath = computed(() => {
  const pathParam = route.params.path;
  if (Array.isArray(pathParam)) {
    return pathParam.join("/");
  }
  return pathParam || "";
});

// Path segments for breadcrumb navigation (cleaned of internal structure)
const pathSegments = computed(() => {
  if (!currentPath.value) return [];
  const segments = currentPath.value.split("/").filter(Boolean);
  // Remove users/userId from the beginning of the path segments
  if (
    segments.length >= 2 &&
    segments[0] === "users" &&
    segments[1] === userId.value
  ) {
    return segments.slice(2); // Remove 'users' and userId
  }
  return segments;
});

// Navigate to a specific path segment (for breadcrumb navigation)
const navigateToSegment = (index: number) => {
  const segments = pathSegments.value.slice(0, index + 1);
  const newPath = segments.join("/");
  if (newPath) {
    navigateTo(`/public/${userId.value}/${newPath}`);
  } else {
    navigateTo(`/public/${userId.value}`);
  }
};

// State
const currentContent = ref<string>("");
const pending = ref(false);
const error = ref<string | null>(null);

// Content caching
const contentCache = new Map<
  string,
  { content: string; rendered: string; timestamp: number }
>();
const CONTENT_CACHE_DURATION = 300000; // 5 minutes

// Clear cache for specific user to prevent stale data
const clearUserCache = (userId: string) => {
  const keysToDelete = Array.from(contentCache.keys()).filter((key) =>
    key.startsWith(`public_${userId}_`)
  );
  keysToDelete.forEach((key) => contentCache.delete(key));
};

// Memoized markdown rendering
const renderedContent = computed(() => {
  if (!currentContent.value) return "";

  const cacheKey = `rendered_${currentContent.value.slice(0, 100)}_${
    currentContent.value.length
  }`;
  const cached = contentCache.get(cacheKey);

  if (cached && cached.content === currentContent.value) {
    return cached.rendered;
  }

  try {
    // Simple approach - just render markdown and add IDs with post-processing
    let html = marked(currentContent.value);

    // Post-process to add IDs to headings
    html = html.replace(
      /<h([123456])>(.+?)<\/h[123456]>/g,
      (match, level, text) => {
        const id = text
          .replace(/<[^>]*>/g, "") // Remove any HTML tags
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .trim();
        return `<h${level} id="${id}">${text}</h${level}>`;
      }
    );

    // Cache the rendered result
    contentCache.set(cacheKey, {
      content: currentContent.value,
      rendered: html,
      timestamp: Date.now(),
    });

    return html;
  } catch (error) {
    console.error("Error rendering markdown:", error);
    // Fallback to basic markdown rendering
    return marked(currentContent.value);
  }
});

// File selection handler
const handleFileSelect = (filePath: string) => {
  // Extract the clean path for URL navigation
  const cleanPath = filePath.replace(/^users\/[^/]+\//, "");
  if (cleanPath && cleanPath !== currentPath.value) {
    // Navigate to the clean URL, but loadFile will handle the full path
    navigateTo(`/public/${userId.value}/${cleanPath}`);
  }
};

// Load file content with caching
const loadFile = async (path: string) => {
  if (!path || !userId.value) return;

  // Create a more specific cache key to avoid collisions
  const cacheKey = `public_${userId.value}_${path}`;

  // Check cache first
  const cached = contentCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CONTENT_CACHE_DURATION) {
    currentContent.value = cached.content;
    return;
  }

  pending.value = true;
  error.value = null;

  try {
    // Check if path already includes the user prefix (from direct file selection)
    const fullPath = path.startsWith(`users/${userId.value}/`)
      ? path
      : `users/${userId.value}/${path}`;
    const response = (await $fetch(
      `/api/public/${fullPath}`
    )) as PublicApiResponse;

    if (response.success && response.type === "file" && response.content) {
      currentContent.value = response.content;

      // Cache the content
      contentCache.set(cacheKey, {
        content: response.content,
        rendered: "", // Will be filled by renderedContent computed
        timestamp: Date.now(),
      });
    } else {
      error.value = "Failed to load file content";
    }
  } catch (err: any) {
    console.error("Failed to load file:", err);
    error.value = err.statusMessage || "Failed to load file";
  } finally {
    pending.value = false;
  }
};

// Debounced loading to prevent rapid successive requests
let loadTimeout: NodeJS.Timeout | null = null;
const debouncedLoadFile = (path: string) => {
  if (loadTimeout) {
    clearTimeout(loadTimeout);
  }
  loadTimeout = setTimeout(() => {
    loadFile(path);
  }, 100); // 100ms debounce
};

// Watch for path changes and load content
watch(
  currentPath,
  (newPath) => {
    if (newPath) {
      debouncedLoadFile(newPath);
    } else {
      currentContent.value = "";
    }
  },
  { immediate: true }
);

// Clear cache when userId changes to prevent stale data
watch(
  userId,
  (newUserId, oldUserId) => {
    if (oldUserId && newUserId !== oldUserId) {
      clearUserCache(oldUserId);
    }
    if (newUserId) {
      clearUserCache(newUserId); // Clear current user cache on page load
    }
  },
  { immediate: true }
);

// Set page title
useHead({
  title: computed(() => {
    if (currentPath.value) {
      return `${currentPath.value} - Public Wiki`;
    }
    return "Public Wiki";
  }),
});
</script>
