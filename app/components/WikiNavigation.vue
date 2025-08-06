<template>
  <div
    class="h-full bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto"
  >
    <div class="p-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Wiki
        </h2>
        <div class="flex items-center gap-1">
          <CButton
            size="md"
            color="gray"
            variant="ghost"
            @click="startInlineCreateFolder()"
            title="Create new folder"
          >
            <CIcon name="i-heroicons-folder-plus" size="xs" />
          </CButton>
          <CButton
            size="md"
            color="gray"
            variant="ghost"
            @click="startInlineCreateFile()"
            title="Create new file"
          >
            <CIcon name="i-heroicons-plus" size="xs" />
          </CButton>
        </div>
      </div>

      <!-- Breadcrumb navigation -->
      <div
        v-if="currentPath"
        class="mb-3 text-xs text-gray-500 dark:text-gray-400"
      >
        <CButton size="xs" color="gray" variant="ghost" class="px-1">
          <CIcon name="i-heroicons-home" size="md" />
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
          <span v-else class="font-medium text-gray-700 dark:text-gray-300">{{
            segment
          }}</span>
          <span v-if="index < pathSegments.length - 1" class="mx-1">/</span>
        </span>
      </div>

      <div v-if="pending" class="flex justify-center py-4">
        <CIcon name="i-heroicons-arrow-path" class="animate-spin" />
      </div>

      <div v-else-if="!files?.files || files.files.length === 0">
        <!-- Inline file creation when no files exist -->
        <div
          v-if="creatingFile"
          class="group flex items-center px-2 py-1 text-sm rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 mb-2"
        >
          <CIcon
            name="i-heroicons-document-text"
            size="sm"
            class="mr-2 text-blue-500"
          />
          <div class="flex-1 flex items-center" @click.stop>
            <CInput
              v-model="createFileName"
              @keyup.enter="confirmCreateFile"
              @keyup.escape="cancelCreate"
              @blur="cancelCreate"
              class="flex-1 text-sm"
              size="sm"
              data-create-type="file"
              :disabled="creating"
              :class="{ 'opacity-50': creating }"
              placeholder="filename"
            />
            <CIcon
              v-if="creating"
              name="i-heroicons-arrow-path"
              class="ml-2 animate-spin text-blue-400"
              size="xs"
            />
          </div>
        </div>

        <!-- Inline folder creation when no files exist -->
        <div
          v-if="creatingFolder"
          class="group flex items-center px-2 py-1 text-sm rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 mb-2"
        >
          <CIcon
            name="i-heroicons-folder"
            size="sm"
            class="mr-2 text-green-500"
          />
          <div class="flex-1 flex items-center" @click.stop>
            <CInput
              v-model="createFolderName"
              @keyup.enter="confirmCreateFolder"
              @keyup.escape="cancelCreate"
              @blur="cancelCreate"
              class="flex-1 text-sm"
              size="sm"
              data-create-type="folder"
              :disabled="creating"
              :class="{ 'opacity-50': creating }"
              placeholder="folder-name"
            />
            <CIcon
              v-if="creating"
              name="i-heroicons-arrow-path"
              class="ml-2 animate-spin text-green-400"
              size="xs"
            />
          </div>
        </div>

        <div
          v-if="!creatingFile && !creatingFolder"
          class="p-4 text-center text-gray-500 dark:text-gray-400 text-sm"
        >
          No files or folders found
        </div>
      </div>

      <div v-else class="space-y-1">
        <!-- Inline file creation -->
        <div
          v-if="creatingFile"
          class="group flex items-center px-2 py-1 text-sm rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700"
        >
          <CIcon
            name="i-heroicons-document-text"
            size="sm"
            class="mr-2 text-blue-500"
          />
          <div class="flex-1 flex items-center" @click.stop>
            <CInput
              v-model="createFileName"
              @keyup.enter="confirmCreateFile"
              @keyup.escape="cancelCreate"
              @blur="cancelCreate"
              class="flex-1 text-sm"
              size="sm"
              data-create-type="file"
              :disabled="creating"
              :class="{ 'opacity-50': creating }"
              placeholder="filename"
            />
            <CIcon
              v-if="creating"
              name="i-heroicons-arrow-path"
              class="ml-2 animate-spin text-blue-400"
              size="xs"
            />
          </div>
        </div>

        <!-- Inline folder creation -->
        <div
          v-if="creatingFolder"
          class="group flex items-center px-2 py-1 text-sm rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700"
        >
          <CIcon
            name="i-heroicons-folder"
            size="sm"
            class="mr-2 text-green-500"
          />
          <div class="flex-1 flex items-center" @click.stop>
            <CInput
              v-model="createFolderName"
              @keyup.enter="confirmCreateFolder"
              @keyup.escape="cancelCreate"
              @blur="cancelCreate"
              class="flex-1 text-sm"
              size="sm"
              data-create-type="folder"
              :disabled="creating"
              :class="{ 'opacity-50': creating }"
              placeholder="folder-name"
            />
            <CIcon
              v-if="creating"
              name="i-heroicons-arrow-path"
              class="ml-2 animate-spin text-green-400"
              size="xs"
            />
          </div>
        </div>

        <div
          v-for="item in files?.files || []"
          :key="item.key"
          class="group flex items-center px-2 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          :class="{ 'cursor-pointer': editingItem !== item.key }"
        >
          <CIcon
            :name="
              item.isFile ? 'i-heroicons-document-text' : 'i-heroicons-folder'
            "
            size="sm"
            class="mr-2 text-gray-500 dark:text-gray-400"
          />
          <div
            v-if="editingItem === item.key"
            class="flex-1 flex items-center"
            @click.stop
          >
            <CInput
              v-model="editingName"
              @keyup.enter="confirmRename(item)"
              @keyup.escape="cancelEdit"
              @blur="cancelEdit"
              class="flex-1 text-sm"
              size="sm"
              data-edit-type="rename"
              :disabled="renaming"
              :class="{ 'opacity-50': renaming }"
            />
            <CIcon
              v-if="renaming"
              name="i-heroicons-arrow-path"
              class="ml-2 animate-spin text-gray-400"
              size="xs"
            />
          </div>
          <span
            v-else
            class="flex-1 truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-gray-900 dark:text-gray-100"
            @click="editingItem === null ? handleItemClick(item) : null"
            @dblclick="startInlineEdit(item)"
            :title="`${item.isFile ? 'File' : 'Directory'}: ${
              item.name
            } (Double-click to rename)`"
          >
            {{ item.name }}
          </span>
          <div
            class="flex items-center gap-1"
            v-show="editingItem !== item.key"
          >
            <CButton
              v-if="!item.isFile"
              size="xs"
              color="gray"
              variant="ghost"
              class="opacity-0 group-hover:opacity-100"
              @click.stop="startInlineCreateFile(item.key)"
              title="Create file in this directory"
            >
              <CIcon name="i-heroicons-plus" size="xs" />
            </CButton>
            <CButton
              v-if="!item.isFile"
              size="xs"
              color="gray"
              variant="ghost"
              class="opacity-0 group-hover:opacity-100"
              @click.stop="startInlineCreateFolder(item.key)"
              title="Create folder in this directory"
            >
              <CIcon name="i-heroicons-folder-plus" size="xs" />
            </CButton>
            <CButton
              size="xs"
              color="gray"
              variant="ghost"
              class="opacity-0 group-hover:opacity-100"
              @click.stop="startInlineEdit(item)"
              title="Rename (or double-click name)"
            >
              <CIcon name="i-heroicons-pencil" size="xs" />
            </CButton>
            <CButton
              v-if="item.isFile"
              size="xs"
              color="red"
              variant="ghost"
              class="opacity-0 group-hover:opacity-100"
              @click.stop="deleteFile(item.key)"
              title="Delete file"
            >
              <CIcon name="i-heroicons-trash" size="xs" />
            </CButton>
            <CButton
              v-if="!item.isFile"
              size="xs"
              color="red"
              variant="ghost"
              class="opacity-0 group-hover:opacity-100"
              @click.stop="deleteDirectory(item.key)"
              title="Delete directory"
            >
              <CIcon name="i-heroicons-trash" size="xs" />
            </CButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from "vue";
interface WikiFile {
  key: string;
  name: string;
  isFile: boolean;
  lastModified?: Date;
  size?: number;
}

const emit = defineEmits<{
  selectFile: [path: string];
}>();

const creating = ref(false);
const renaming = ref(false);
const createInDirectory = ref("");
const editingItem = ref<string | null>(null);
const editingName = ref("");

const creatingFile = ref(false);
const creatingFolder = ref(false);
const createFileName = ref("");
const createFolderName = ref("");

const { user, $fetchWithAuth } = useAuth() as {
  user: Ref<{ id: string } | null>;
  $fetchWithAuth: (url: string, options?: any) => Promise<any>;
};
const currentPath = ref("");

const pathSegments = computed(() => {
  return currentPath.value ? currentPath.value.split("/").filter(Boolean) : [];
});

const navigateToPath = (index: number) => {
  const segments = pathSegments.value.slice(0, index + 1);
  currentPath.value = segments.join("/") + (segments.length > 0 ? "/" : "");
};

const {
  data: files,
  pending,
  refresh,
} = await useLazyFetch<{ files: WikiFile[]; success: boolean }>(
  "/api/wiki/files",
  {
    query: computed(() => ({
      path: user.value
        ? `users/${user.value.id}/${currentPath.value}`
        : currentPath.value,
    })),
    watch: [user, currentPath],
    server: false, // Client-side only since we need auth headers
    transform: (data: any) => data,
    $fetch: $fetchWithAuth as any,
  }
);

const handleItemClick = (item: WikiFile) => {
  if (item.isFile) {
    emit("selectFile", item.key);
  } else {
    // Navigate to folder
    const userPrefix = user.value ? `users/${user.value.id}/` : "";
    currentPath.value = item.key?.replace(userPrefix, "") || "";
  }
};

const startInlineCreateFile = (directory?: string) => {
  // Cancel any existing creation/editing
  cancelCreate();
  cancelEdit();

  createInDirectory.value = directory || "";
  creatingFile.value = true;
  createFileName.value = "";

  // Focus the input after Vue updates the DOM
  nextTick(() => {
    setTimeout(() => {
      const input = document.querySelector(
        'input[data-create-type="file"]'
      ) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 10);
  });
};

const startInlineCreateFolder = (directory?: string) => {
  // Cancel any existing creation/editing
  cancelCreate();
  cancelEdit();

  createInDirectory.value = directory || "";
  creatingFolder.value = true;
  createFolderName.value = "";

  // Focus the input after Vue updates the DOM
  nextTick(() => {
    setTimeout(() => {
      const input = document.querySelector(
        'input[data-create-type="folder"]'
      ) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 10);
  });
};

const cancelCreate = () => {
  creatingFile.value = false;
  creatingFolder.value = false;
  createFileName.value = "";
  createFolderName.value = "";
  createInDirectory.value = "";
};

const confirmCreateFile = async () => {
  if (!createFileName.value.trim()) {
    cancelCreate();
    return;
  }

  creating.value = true;
  const userPrefix = user.value ? `users/${user.value.id}/` : "";
  const basePath = createInDirectory.value || currentPath.value;

  // Add .md extension if no extension is provided
  let fileName = createFileName.value.trim();
  if (!fileName.includes(".")) {
    fileName += ".md";
  }

  const fullPath = `${userPrefix}${basePath}${
    basePath && !basePath.endsWith("/") ? "/" : ""
  }${fileName}`;

  try {
    await $fetchWithAuth(`/api/wiki/${fullPath}`, {
      method: "PUT",
      body: { content: "# New File\n\nStart editing..." },
    });

    cancelCreate();
    await refresh();
    emit("selectFile", fullPath);
  } catch (error) {
    console.error("Failed to create file:", error);
    alert("Failed to create file. Please try again.");
  } finally {
    creating.value = false;
  }
};

const confirmCreateFolder = async () => {
  if (!createFolderName.value.trim()) {
    cancelCreate();
    return;
  }

  creating.value = true;
  const userPrefix = user.value ? `users/${user.value.id}/` : "";
  const basePath = createInDirectory.value || currentPath.value;
  const folderPath = `${userPrefix}${basePath}${
    basePath && !basePath.endsWith("/") ? "/" : ""
  }${createFolderName.value.trim()}/.gitkeep`;

  try {
    await $fetchWithAuth(`/api/wiki/${folderPath}`, {
      method: "PUT",
      body: { content: "# This file keeps the directory in git" },
    });

    cancelCreate();
    await refresh();
  } catch (error) {
    console.error("Failed to create folder:", error);
    alert("Failed to create folder. Please try again.");
  } finally {
    creating.value = false;
  }
};

const deleteFile = async (path: string) => {
  if (!confirm("Are you sure you want to delete this file?")) return;

  try {
    await $fetchWithAuth(`/api/wiki/${path}`, { method: "DELETE" });
    await refresh();
  } catch (error) {
    console.error("Failed to delete file:", error);
  }
};

const deleteDirectory = async (path: string) => {
  const folderName = path.split("/").filter(Boolean).pop() || "this directory";
  if (
    !confirm(
      `Are you sure you want to delete the directory "${folderName}" and all its contents? This action cannot be undone.`
    )
  )
    return;

  try {
    await $fetchWithAuth(`/api/wiki/directory/${encodeURIComponent(path)}`, {
      method: "DELETE",
    });
    await refresh();
  } catch (error) {
    console.error("Failed to delete directory:", error);
    alert("Failed to delete directory. Please try again.");
  }
};

const startInlineEdit = (item: WikiFile) => {
  editingItem.value = item.key;
  editingName.value = item.name;

  // Focus the input after Vue updates the DOM
  nextTick(() => {
    setTimeout(() => {
      const input = document.querySelector(
        'input[data-edit-type="rename"]'
      ) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 10);
  });
};

const cancelEdit = () => {
  editingItem.value = null;
  editingName.value = "";
};

const confirmRename = async (item: WikiFile) => {
  if (!editingName.value.trim() || editingName.value === item.name) {
    cancelEdit();
    return;
  }

  renaming.value = true;

  try {
    // Calculate old and new paths
    const oldPath = item.key;
    let newPath: string;

    if (item.isFile) {
      // For files, replace the filename in the full path
      const pathParts = oldPath.split("/");
      pathParts[pathParts.length - 1] = editingName.value.trim();
      newPath = pathParts.join("/");
    } else {
      // For directories, replace the directory name in the full path
      const pathParts = oldPath.split("/").filter(Boolean);
      pathParts[pathParts.length - 1] = editingName.value.trim();
      newPath = pathParts.join("/") + "/";
    }

    await $fetchWithAuth("/api/wiki/rename", {
      method: "POST",
      body: {
        oldPath,
        newPath,
        isDirectory: !item.isFile,
      },
    });

    const wasFile = item.isFile;
    cancelEdit();
    await refresh();

    // If we renamed the currently selected file, update the selection
    if (wasFile) {
      emit("selectFile", newPath);
    }
  } catch (error) {
    console.error("Failed to rename:", error);
    alert("Failed to rename. Please try again.");
    cancelEdit();
  } finally {
    renaming.value = false;
  }
};
</script>
