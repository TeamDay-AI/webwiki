<template>
  <div class="h-full bg-gray-50 border-r border-gray-200 overflow-y-auto">
    <div class="p-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">Wiki Files</h2>
        <UButton 
          icon="i-heroicons-plus" 
          size="xs" 
          color="gray" 
          variant="ghost"
          @click="showCreateModal = true"
        />
      </div>
      
      <div v-if="pending" class="flex justify-center py-4">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
      </div>
      
      <div v-else class="space-y-1">
        <div 
          v-for="item in files" 
          :key="item.key"
          class="group flex items-center px-2 py-1 text-sm rounded-md hover:bg-gray-100 cursor-pointer"
          @click="handleItemClick(item)"
        >
          <UIcon 
            :name="item.isFile ? 'i-heroicons-document-text' : 'i-heroicons-folder'" 
            class="w-4 h-4 mr-2 text-gray-500"
          />
          <span class="flex-1 truncate">{{ item.name }}</span>
          <UButton
            v-if="item.isFile"
            icon="i-heroicons-trash"
            size="xs"
            color="red"
            variant="ghost"
            class="opacity-0 group-hover:opacity-100"
            @click.stop="deleteFile(item.key)"
          />
        </div>
      </div>
    </div>

    <UModal v-model="showCreateModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Create New File</h3>
        </template>
        
        <UForm :state="createForm" @submit="createFile">
          <UFormGroup label="File Path" name="path">
            <UInput 
              v-model="createForm.path" 
              placeholder="folder/filename.md"
              required
            />
          </UFormGroup>
          
          <div class="flex justify-end gap-2 mt-4">
            <UButton color="gray" variant="ghost" @click="showCreateModal = false">
              Cancel
            </UButton>
            <UButton type="submit" :loading="creating">
              Create
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
interface WikiFile {
  key: string
  name: string
  isFile: boolean
  lastModified?: Date
  size?: number
}

const emit = defineEmits<{
  selectFile: [path: string]
}>()

const showCreateModal = ref(false)
const creating = ref(false)
const createForm = reactive({
  path: ''
})

const { data: files, pending, refresh } = await useFetch<{files: WikiFile[], success: boolean}>('/api/wiki/files')

const handleItemClick = (item: WikiFile) => {
  if (item.isFile) {
    emit('selectFile', item.key)
  } else {
    // TODO: Implement folder navigation
    console.log('Navigate to folder:', item.key)
  }
}

const createFile = async () => {
  if (!createForm.path) return
  
  creating.value = true
  try {
    await $fetch(`/api/wiki/${createForm.path}`, {
      method: 'PUT',
      body: { content: '# New File\n\nStart editing...' }
    })
    
    showCreateModal.value = false
    createForm.path = ''
    await refresh()
    emit('selectFile', createForm.path)
  } catch (error) {
    console.error('Failed to create file:', error)
  } finally {
    creating.value = false
  }
}

const deleteFile = async (path: string) => {
  if (!confirm('Are you sure you want to delete this file?')) return
  
  try {
    await $fetch(`/api/wiki/${path}`, { method: 'DELETE' })
    await refresh()
  } catch (error) {
    console.error('Failed to delete file:', error)
  }
}
</script>