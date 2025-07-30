<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <div class="flex items-center space-x-2">
        <h2 class="text-lg font-semibold text-gray-900">
          {{ parsedFile?.name || "Select a file to edit" }}
        </h2>
        <CBadge v-if="autoSaving" color="blue" variant="soft">
          Auto-saving...
        </CBadge>
        <CBadge v-else-if="hasUnsavedChanges" color="yellow" variant="soft">
          Unsaved
        </CBadge>
      </div>

      <div class="flex items-center space-x-2">
        <CButton
          :disabled="!currentFile"
          variant="outline"
          @click="togglePreview"
        >
          {{ showPreview ? "Edit" : "Preview" }}
        </CButton>
        <CButton
          :disabled="!currentFile"
          variant="outline"
          :loading="sharing"
          @click="shareFile"
          title="Copy shareable public link"
        >
          <CIcon v-if="!sharing" name="i-heroicons-share" size="sm" class="mr-1" />
          {{ sharing ? "Copied!" : "Share" }}
        </CButton>
        <CButton
          v-if="!showPreview"
          :disabled="!currentFile || !hasUnsavedChanges"
          :loading="saving"
          @click="saveFile"
        >
          Save
        </CButton>
      </div>
    </div>

    <div
      v-if="!currentFile"
      class="flex-1 flex items-center justify-center text-gray-500"
    >
      <div class="text-center">
        <CIcon
          name="i-heroicons-document-text"
          size="2xl"
          class="mx-auto mb-4 text-gray-300"
        />
        <p class="text-lg">
          Select a file from the navigation to start editing
        </p>
      </div>
    </div>

    <div v-else class="flex-1 flex">
      <div v-if="!showPreview" class="flex-1">
        <textarea
          v-model="content"
          class="w-full h-full p-4 font-mono text-sm border-none resize-none focus:outline-none focus:ring-0"
          placeholder="Start writing your markdown content..."
          @input="handleContentChange"
        />
      </div>

      <div v-else class="flex-1 p-4 overflow-y-auto prose">
        <div v-html="renderedContent" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from "marked";

// Get auth user for generating public URLs
const { user } = useAuth();

const props = defineProps<{
  filePath?: string;
}>();

const emit = defineEmits<{
  contentChange: [content: string];
}>();

const currentFile = ref(props.filePath);
const content = ref("");
const originalContent = ref("");
const showPreview = ref(true);
const saving = ref(false);
const autoSaving = ref(false);
const sharing = ref(false);
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

const hasUnsavedChanges = computed(
  () => content.value !== originalContent.value
);

const renderedContent = computed(() => {
  if (!content.value) {
    console.log('No content to render');
    return "";
  }
  
  console.log('Rendering content for file:', currentFile.value, 'Content length:', content.value.length);
  
  try {
    // Simple approach - just render markdown and add IDs with post-processing
    let html = marked(content.value);
    
    // Post-process to add IDs to headings
    html = html.replace(/<h([123456])>(.+?)<\/h[123456]>/g, (match, level, text) => {
      const id = text
        .replace(/<[^>]*>/g, '') // Remove any HTML tags
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      return `<h${level} id="${id}">${text}</h${level}>`;
    });
    
    return html;
  } catch (error) {
    console.error('Error rendering markdown:', error);
    // Fallback to basic markdown rendering
    return marked(content.value);
  }
});

const parsedFile = computed(() => {
  if (!currentFile.value) return null;

  // Remove the users/userid/ prefix for display but keep full directory structure
  const cleanPath = currentFile.value.replace(/^users\/[^/]+\//, "");
  
  // Show the full path instead of just filename
  const displayPath = cleanPath || currentFile.value;

  return {
    name: displayPath,
    path: currentFile.value,
  };
});

const loadFile = async (path: string) => {
  if (!path) return;

  console.log('Loading file:', path);

  // Clear any pending autosave when switching files
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
  }

  try {
    const response = await $fetch<{ content: string; success: boolean }>(
      `/api/wiki/${path}`
    );
    console.log('File loaded successfully:', path, 'Content length:', response.content?.length);
    if (response.success) {
      content.value = response.content;
      originalContent.value = response.content;
      currentFile.value = path;
    }
  } catch (error) {
    console.error("Failed to load file:", error);
  }
};

const saveFile = async (isAutoSave = false) => {
  if (!currentFile.value || !hasUnsavedChanges.value) return;

  if (isAutoSave) {
    autoSaving.value = true;
  } else {
    saving.value = true;
  }

  try {
    await $fetch(`/api/wiki/${currentFile.value}`, {
      method: "PUT",
      body: { content: content.value },
    });
    originalContent.value = content.value;
  } catch (error) {
    console.error("Failed to save file:", error);
  } finally {
    if (isAutoSave) {
      autoSaving.value = false;
    } else {
      saving.value = false;
    }
  }
};

const debouncedAutoSave = () => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }
  
  autoSaveTimer = setTimeout(() => {
    if (hasUnsavedChanges.value && currentFile.value) {
      saveFile(true);
    }
  }, 3000);
};

const handleContentChange = () => {
  emit("contentChange", content.value);
  debouncedAutoSave();
};

const togglePreview = () => {
  showPreview.value = !showPreview.value;
};

const shareFile = async () => {
  if (!currentFile.value || !user.value || sharing.value) return;
  
  sharing.value = true;
  
  try {
    // Extract the clean path (remove users/userId/ prefix)
    const cleanPath = currentFile.value.replace(/^users\/[^/]+\//, "");
    
    // Generate public URL
    const publicUrl = `${window.location.origin}/public/${user.value.id}/${cleanPath}`;
    
    // Copy to clipboard
    await navigator.clipboard.writeText(publicUrl);
    
    console.log('Public URL copied to clipboard:', publicUrl);
    
    // Show success feedback for 1.5 seconds
    setTimeout(() => {
      sharing.value = false;
    }, 1500);
    
  } catch (error) {
    console.error('Failed to copy URL to clipboard:', error);
    
    try {
      // Fallback: create temporary input to copy
      const cleanPath = currentFile.value.replace(/^users\/[^/]+\//, "");
      const publicUrl = `${window.location.origin}/public/${user.value.id}/${cleanPath}`;
      
      const textArea = document.createElement('textarea');
      textArea.value = publicUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      console.log('URL copied using fallback method:', publicUrl);
      
      // Show success feedback for 1.5 seconds
      setTimeout(() => {
        sharing.value = false;
      }, 1500);
      
    } catch (fallbackError) {
      console.error('Fallback copy method also failed:', fallbackError);
      sharing.value = false;
    }
  }
};

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "s") {
    event.preventDefault();
    saveFile();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }
});

watch(
  () => props.filePath,
  (newPath) => {
    if (newPath) {
      loadFile(newPath);
    }
  }
);

defineExpose({
  loadFile,
  saveFile,
});
</script>
