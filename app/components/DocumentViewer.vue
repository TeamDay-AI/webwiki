<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div
      class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
    >
      <div class="flex items-center space-x-2">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ parsedFile?.name || "Select a file to view" }}
        </h2>
        <CBadge v-if="autoSaving" color="blue" variant="soft">
          Auto-saving...
        </CBadge>
        <CBadge v-else-if="hasUnsavedChanges" color="yellow" variant="soft">
          Unsaved
        </CBadge>
      </div>

      <div class="flex items-center space-x-2">
        <!-- Edit Mode Toggle -->
        <CButton
          v-if="!isEditMode"
          :disabled="!currentFile"
          variant="outline"
          @click="toggleEditMode"
        >
          <CIcon
            name="i-heroicons-pencil"
            size="md"
            color="blue-600"
            class="mr-1"
          />
          Edit
        </CButton>

        <!-- Edit Mode Actions -->
        <template v-else>
          <CButton variant="ghost" @click="toggleEditMode">
            <CIcon
              name="i-heroicons-eye"
              size="md"
              color="blue-600"
              class="mr-1"
            />
            View
          </CButton>
          <CButton
            :disabled="!currentFile"
            variant="outline"
            :loading="sharing"
            @click="shareFile"
            title="Copy shareable public link"
          >
            <CIcon
              v-if="!sharing"
              name="i-heroicons-share"
              size="md"
              color="blue-600"
              class="mr-1"
            />
            {{ sharing ? "Copied!" : "Share" }}
          </CButton>
          <CButton
            :disabled="!currentFile || !hasUnsavedChanges"
            :loading="saving"
            @click="() => saveFile()"
          >
            Save
          </CButton>
        </template>
      </div>
    </div>

    <!-- No File Selected -->
    <div
      v-if="!currentFile"
      class="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900"
    >
      <div class="text-center">
        <CIcon
          name="i-heroicons-document-text"
          size="2xl"
          class="mx-auto mb-4 text-gray-300"
        />
        <p class="text-lg">
          Select a file from the navigation to start viewing
        </p>
      </div>
    </div>

    <!-- Content Area -->
    <div v-else class="flex-1 flex flex-col">
      <!-- Visual Editor Mode (with toolbar when editing) -->
      <div v-if="isEditMode" class="flex-1 flex flex-col">
        <!-- WYSIWYG Toolbar (only shown in edit mode) -->
        <div
          class="border-b border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800"
        >
          <div class="flex items-center space-x-1 flex-wrap gap-1">
            <!-- Text Formatting -->
            <div
              class="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-2"
            >
              <button
                @click="toggleBold"
                :class="[
                  'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
                  isBold ? 'bg-gray-200 dark:bg-gray-700' : '',
                ]"
                title="Bold"
              >
                <CIcon name="i-heroicons-bold" size="md" />
              </button>
              <button
                @click="toggleItalic"
                :class="[
                  'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
                  isItalic ? 'bg-gray-200 dark:bg-gray-700' : '',
                ]"
                title="Italic"
              >
                <CIcon name="i-heroicons-italic" size="md" />
              </button>
              <button
                @click="toggleStrike"
                :class="[
                  'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
                  isStrike ? 'bg-gray-200 dark:bg-gray-700' : '',
                ]"
                title="Strikethrough"
              >
                <CIcon name="i-heroicons-strikethrough" size="md" />
              </button>
            </div>

            <!-- Headings -->
            <div
              class="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-2"
            >
              <button
                @click="setHeading(1)"
                :class="[
                  'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
                  isHeading(1) ? 'bg-gray-200 dark:bg-gray-700' : '',
                ]"
                title="Heading 1"
              >
                <CIcon name="i-heroicons-h1" size="md" />
              </button>
              <button
                @click="setHeading(2)"
                :class="[
                  'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
                  isHeading(2) ? 'bg-gray-200 dark:bg-gray-700' : '',
                ]"
                title="Heading 2"
              >
                <CIcon name="i-heroicons-h2" size="md" />
              </button>
              <button
                @click="setHeading(3)"
                :class="[
                  'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
                  isHeading(3) ? 'bg-gray-200 dark:bg-gray-700' : '',
                ]"
                title="Heading 3"
              >
                <CIcon name="i-heroicons-h3" size="md" />
              </button>
            </div>

            <!-- Lists -->
            <div
              class="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-2"
            >
              <button
                @click="toggleBulletList"
                :class="[
                  'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
                  isBulletList ? 'bg-gray-200 dark:bg-gray-700' : '',
                ]"
                title="Bullet List"
              >
                <CIcon name="i-heroicons-list-bullet" size="md" />
              </button>
              <button
                @click="toggleOrderedList"
                :class="[
                  'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
                  isOrderedList ? 'bg-gray-200 dark:bg-gray-700' : '',
                ]"
                title="Numbered List"
              >
                <CIcon name="i-heroicons-numbered-list" size="md" />
              </button>
              <button
                @click="toggleTaskList"
                :class="[
                  'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
                  isTaskList ? 'bg-gray-200 dark:bg-gray-700' : '',
                ]"
                title="Task List"
              >
                <CIcon name="i-heroicons-check-circle" size="md" />
              </button>
            </div>

            <!-- Other -->
            <div class="flex items-center space-x-1">
              <button
                @click="toggleBlockquote"
                :class="[
                  'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
                  isBlockquote ? 'bg-gray-200 dark:bg-gray-700' : '',
                ]"
                title="Quote"
              >
                <CIcon name="i-heroicons-chat-bubble-left-right" size="md" />
              </button>
              <button
                @click="toggleCodeBlock"
                :class="[
                  'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
                  isCodeBlock ? 'bg-gray-200 dark:bg-gray-700' : '',
                ]"
                title="Code Block"
              >
                <CIcon name="i-heroicons-code-bracket-square" size="md" />
              </button>
              <button
                @click="addLink"
                class="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Add Link"
              >
                <CIcon name="i-heroicons-link" size="md" />
              </button>
            </div>
          </div>
        </div>

        <!-- TipTap Editor (editable) -->
        <div class="flex-1 overflow-hidden">
          <div
            ref="editorElement"
            class="h-full p-4 prose prose-sm max-w-none focus:outline-none bg-white dark:bg-gray-900 dark:prose-invert overflow-y-auto"
          />
        </div>
      </div>

      <!-- Read-only Visual Mode -->
      <div
        v-else
        class="flex-1 p-4 overflow-y-auto prose prose-sm max-w-none bg-white dark:bg-gray-900 dark:prose-invert"
      >
        <div v-html="renderedContent" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from "marked";
import { Editor } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import TurndownService from "turndown";

// Define user interface
interface User {
  id: string;
  email?: string;
  [key: string]: unknown;
}

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
const isEditMode = ref(false);
const saving = ref(false);
const autoSaving = ref(false);
const sharing = ref(false);
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

// TipTap editor instance and state
const editorElement = ref<HTMLElement>();
let editor: Editor | null = null;
const isBold = ref(false);
const isItalic = ref(false);
const isStrike = ref(false);
const isBulletList = ref(false);
const isOrderedList = ref(false);
const isTaskList = ref(false);
const isBlockquote = ref(false);
const isCodeBlock = ref(false);

// Turndown service for converting HTML to Markdown
const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

// Configure turndown for better markdown conversion
turndownService.addRule("taskList", {
  filter: function (node: Node) {
    return (
      (node as Element).tagName === "LI" &&
      (node as Element).getAttribute("data-type") === "taskItem"
    );
  },
  replacement: function (content: string, node: Node) {
    const element = node as Element;
    const isChecked = element.getAttribute("data-checked") === "true";
    return `${isChecked ? "- [x]" : "- [ ]"} ${content}\n`;
  },
});

const hasUnsavedChanges = computed(
  () => content.value !== originalContent.value
);

const renderedContent = computed(() => {
  return marked(content.value);
});

const parsedFile = computed(() => {
  if (!currentFile.value) return null;
  const parts = currentFile.value.split("/");
  return {
    name: parts[parts.length - 1] || currentFile.value,
    path: currentFile.value,
  };
});

// Toggle between view and edit mode
const toggleEditMode = () => {
  if (isEditMode.value) {
    // Switching from edit to view mode
    if (editor) {
      // Sync content when leaving edit mode
      const html = editor.getHTML();
      const markdown = turndownService.turndown(html);
      content.value = markdown;
      destroyEditor();
    }
    isEditMode.value = false;
  } else {
    // Switching from view to edit mode
    isEditMode.value = true;
    nextTick(() => {
      initEditor();
    });
  }
};

// Initialize TipTap editor
const initEditor = () => {
  if (!editorElement.value || editor) return;

  editor = new Editor({
    element: editorElement.value,
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: marked(content.value),
    onUpdate: ({ editor }) => {
      // Convert HTML back to markdown
      const html = editor.getHTML();
      const markdown = turndownService.turndown(html);
      content.value = markdown;
      handleContentChange();
      updateToolbarState();
    },
    onSelectionUpdate: () => {
      updateToolbarState();
    },
  });

  updateToolbarState();
};

// Destroy TipTap editor
const destroyEditor = () => {
  if (editor) {
    editor.destroy();
    editor = null;
  }
};

// Update toolbar button states based on current selection
const updateToolbarState = () => {
  if (!editor) return;

  isBold.value = editor.isActive("bold");
  isItalic.value = editor.isActive("italic");
  isStrike.value = editor.isActive("strike");
  isBulletList.value = editor.isActive("bulletList");
  isOrderedList.value = editor.isActive("orderedList");
  isTaskList.value = editor.isActive("taskList");
  isBlockquote.value = editor.isActive("blockquote");
  isCodeBlock.value = editor.isActive("codeBlock");
};

// Toolbar actions
const toggleBold = () => editor?.chain().focus().toggleBold().run();
const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
const toggleStrike = () => editor?.chain().focus().toggleStrike().run();

const setHeading = (level: number) => {
  if (editor?.isActive("heading", { level })) {
    editor.chain().focus().setParagraph().run();
  } else {
    editor
      ?.chain()
      .focus()
      .toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 })
      .run();
  }
};

const isHeading = (level: number) =>
  editor?.isActive("heading", { level }) || false;

const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run();
const toggleOrderedList = () =>
  editor?.chain().focus().toggleOrderedList().run();
const toggleTaskList = () => editor?.chain().focus().toggleTaskList().run();
const toggleBlockquote = () => editor?.chain().focus().toggleBlockquote().run();
const toggleCodeBlock = () => editor?.chain().focus().toggleCodeBlock().run();

const addLink = () => {
  const url = window.prompt("Enter URL:");
  if (url) {
    editor?.chain().focus().setLink({ href: url }).run();
  }
};

// File operations
const { $fetchWithAuth } = useAuth();

const loadFile = async (path: string) => {
  if (!path) return;

  console.log("Loading file:", path);

  // Clear any pending autosave when switching files
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
  }

  try {
    const response = (await $fetchWithAuth(`/api/wiki/${path}`)) as {
      content: string;
      success: boolean;
    };
    console.log(
      "File loaded successfully:",
      path,
      "Content length:",
      response.content?.length
    );
    if (response.success) {
      content.value = response.content;
      originalContent.value = response.content;
      currentFile.value = path;

      // Update editor content if in edit mode
      if (isEditMode.value && editor) {
        editor.commands.setContent(marked(content.value));
      }
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
    await $fetchWithAuth(`/api/wiki/${currentFile.value}`, {
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

const shareFile = async () => {
  if (!currentFile.value || !user.value) return;

  sharing.value = true;
  try {
    const baseUrl = window.location.origin;
    const publicUrl = `${baseUrl}/public/${user.value.id}/${currentFile.value}`;

    await navigator.clipboard.writeText(publicUrl);

    setTimeout(() => {
      sharing.value = false;
    }, 2000);
  } catch (error) {
    console.error("Failed to copy URL:", error);
    sharing.value = false;
  }
};

// Watch for file path changes
watch(
  () => props.filePath,
  (newPath) => {
    if (newPath && newPath !== currentFile.value) {
      // Exit edit mode when switching files
      if (isEditMode.value) {
        isEditMode.value = false;
        destroyEditor();
      }
      loadFile(newPath);
    }
  },
  { immediate: true }
);

// Cleanup on unmount
onUnmounted(() => {
  destroyEditor();
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }
});
</script>
