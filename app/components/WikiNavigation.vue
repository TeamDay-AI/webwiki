<template>
  <div class="h-full bg-gray-50 border-r border-gray-200 overflow-y-auto">
    <div class="p-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">Wiki Files</h2>
        <div class="flex items-center gap-1">
          <CButton
            size="md"
            color="gray"
            variant="ghost"
            @click="showCreateFolderModal = true"
            title="Create new folder"
          >
            <CIcon name="i-heroicons-folder-plus" size="xs" />
          </CButton>
          <CButton
            size="md"
            color="gray"
            variant="ghost"
            @click="showCreateModal = true"
            title="Create new file"
          >
            <CIcon name="i-heroicons-plus" size="xs" />
          </CButton>
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

      <div v-else-if="!files?.files || files.files.length === 0" class="p-4 text-center text-gray-500 text-sm">
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
          <div class="flex items-center gap-1">
            <CButton
              v-if="!item.isFile"
              size="xs"
              color="gray"
              variant="ghost"
              class="opacity-0 group-hover:opacity-100"
              @click.stop="
                showCreateModal = true;
                createInDirectory = item.key;
              "
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
              @click.stop="
                showCreateFolderModal = true;
                createInDirectory = item.key;
              "
              title="Create folder in this directory"
            >
              <CIcon name="i-heroicons-folder-plus" size="xs" />
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

    <CModal v-model="showCreateModal">
      <CCard>
        <template #header>
          <h3 class="text-lg font-semibold">Create New File</h3>
        </template>

        <CForm :state="createForm" @submit="createFile">
          <CFormGroup label="File Name" name="path">
            <CInput
              v-model="createForm.path"
              placeholder="filename.md"
              required
            />
          </CFormGroup>

          <div class="flex justify-end gap-2 mt-4">
            <CButton
              color="gray"
              variant="ghost"
              @click="
                showCreateModal = false;
                createInDirectory = '';
              "
            >
              Cancel
            </CButton>
            <CButton type="submit" :loading="creating"> Create </CButton>
          </div>
        </CForm>
      </CCard>
    </CModal>

    <CModal v-model="showCreateFolderModal">
      <CCard>
        <template #header>
          <h3 class="text-lg font-semibold">Create New Folder</h3>
        </template>

        <CForm :state="createFolderForm" @submit="createFolder">
          <CFormGroup label="Folder Name" name="name">
            <CInput
              v-model="createFolderForm.name"
              placeholder="folder-name"
              required
            />
          </CFormGroup>

          <div class="flex justify-end gap-2 mt-4">
            <CButton
              color="gray"
              variant="ghost"
              @click="
                showCreateFolderModal = false;
                createInDirectory = '';
              "
            >
              Cancel
            </CButton>
            <CButton type="submit" :loading="creating"> Create </CButton>
          </div>
        </CForm>
      </CCard>
    </CModal>
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

const emit = defineEmits<{
  selectFile: [path: string];
}>();

const showCreateModal = ref(false);
const showCreateFolderModal = ref(false);
const creating = ref(false);
const createInDirectory = ref("");
const createForm = reactive({
  path: "",
});
const createFolderForm = reactive({
  name: "",
});

const { user } = useAuth();
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
} = await useFetch<{ files: WikiFile[]; success: boolean }>("/api/wiki/files", {
  query: computed(() => ({
    path: user.value
      ? `users/${user.value.id}/${currentPath.value}`
      : currentPath.value,
  })),
  watch: [user, currentPath],
});

const handleItemClick = (item: WikiFile) => {
  if (item.isFile) {
    emit("selectFile", item.key);
  } else {
    // Navigate to folder
    const userPrefix = user.value ? `users/${user.value.id}/` : "";
    currentPath.value = item.key?.replace(userPrefix, "") || "";
  }
};

const createFile = async () => {
  if (!createForm.path) return;

  creating.value = true;
  const userPrefix = user.value ? `users/${user.value.id}/` : "";
  const basePath = createInDirectory.value || currentPath.value;
  const fullPath = `${userPrefix}${basePath}${basePath && !basePath.endsWith("/") ? "/" : ""}${createForm.path}`;

  try {
    await $fetch(`/api/wiki/${fullPath}`, {
      method: "PUT",
      body: { content: "# New File\n\nStart editing..." },
    });

    showCreateModal.value = false;
    createForm.path = "";
    createInDirectory.value = "";
    await refresh();
    emit("selectFile", fullPath);
  } catch (error) {
    console.error("Failed to create file:", error);
  } finally {
    creating.value = false;
  }
};

const createFolder = async () => {
  if (!createFolderForm.name) return;

  creating.value = true;
  const userPrefix = user.value ? `users/${user.value.id}/` : "";
  const basePath = createInDirectory.value || currentPath.value;
  const folderPath = `${userPrefix}${basePath}${basePath && !basePath.endsWith("/") ? "/" : ""}${createFolderForm.name}/.gitkeep`;

  try {
    await $fetch(`/api/wiki/${folderPath}`, {
      method: "PUT",
      body: { content: "# This file keeps the directory in git" },
    });

    showCreateFolderModal.value = false;
    createFolderForm.name = "";
    createInDirectory.value = "";
    await refresh();
  } catch (error) {
    console.error("Failed to create folder:", error);
  } finally {
    creating.value = false;
  }
};

const deleteFile = async (path: string) => {
  if (!confirm("Are you sure you want to delete this file?")) return;

  try {
    await $fetch(`/api/wiki/${path}`, { method: "DELETE" });
    await refresh();
  } catch (error) {
    console.error("Failed to delete file:", error);
  }
};

const deleteDirectory = async (path: string) => {
  const folderName = path.split('/').filter(Boolean).pop() || 'this directory';
  if (!confirm(`Are you sure you want to delete the directory "${folderName}" and all its contents? This action cannot be undone.`)) return;

  try {
    await $fetch(`/api/wiki/directory/${encodeURIComponent(path)}`, { method: "DELETE" });
    await refresh();
  } catch (error) {
    console.error("Failed to delete directory:", error);
    alert("Failed to delete directory. Please try again.");
  }
};
</script>
