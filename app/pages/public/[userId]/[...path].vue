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
      <div class="flex-1 p-4 overflow-y-auto prose">
        <div v-if="pending" class="flex justify-center py-8">
          <CIcon name="i-heroicons-arrow-path" class="animate-spin" size="lg" />
        </div>
        <div v-else-if="error" class="text-center py-8 text-red-600">
          <p>{{ error }}</p>
        </div>
        <div v-else-if="renderedContent" v-html="renderedContent" />
        <div v-else class="text-center py-8 text-gray-500">
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

// Path segments for breadcrumb navigation
const pathSegments = computed(() => {
  if (!currentPath.value) return [];
  return currentPath.value.split("/").filter(Boolean);
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

// Computed properties
const renderedContent = computed(() => {
  if (!currentContent.value) return "";

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

    return html;
  } catch (error) {
    console.error("Error rendering markdown:", error);
    // Fallback to basic markdown rendering
    return marked(currentContent.value);
  }
});

// File selection handler
const handleFileSelect = (filePath: string) => {
  // Remove user prefix and navigate to public URL
  const cleanPath = filePath.replace(/^users\/[^/]+\//, "");
  if (cleanPath && cleanPath !== currentPath.value) {
    navigateTo(`/public/${userId.value}/${cleanPath}`);
  }
};

// Load file content
const loadFile = async (path: string) => {
  if (!path || !userId.value) return;

  pending.value = true;
  error.value = null;

  try {
    const fullPath = `users/${userId.value}/${path}`;
    // For now, public pages will show an error since we need authentication
    // TODO: Create a public endpoint or implement public file sharing
    error.value =
      "Public file access is currently disabled due to authentication requirements. Please sign in to access files.";
  } catch (err: any) {
    console.error("Failed to load file:", err);
    error.value = "Public file access is currently disabled";
  } finally {
    pending.value = false;
  }
};

// Watch for path changes and load content
watch(
  currentPath,
  (newPath) => {
    if (newPath) {
      loadFile(newPath);
    } else {
      currentContent.value = "";
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
