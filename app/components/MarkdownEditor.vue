<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <div class="flex items-center space-x-2">
        <h2 class="text-lg font-semibold text-gray-900">
          {{ currentFile || 'Select a file to edit' }}
        </h2>
        <UBadge v-if="hasUnsavedChanges" color="yellow" variant="soft">
          Unsaved
        </UBadge>
      </div>
      
      <div class="flex items-center space-x-2">
        <UButton
          :disabled="!currentFile"
          variant="outline"
          @click="togglePreview"
        >
          {{ showPreview ? 'Edit' : 'Preview' }}
        </UButton>
        <UButton
          :disabled="!currentFile || !hasUnsavedChanges"
          :loading="saving"
          @click="saveFile"
        >
          Save
        </UButton>
      </div>
    </div>

    <div v-if="!currentFile" class="flex-1 flex items-center justify-center text-gray-500">
      <div class="text-center">
        <UIcon name="i-heroicons-document-text" class="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p class="text-lg">Select a file from the navigation to start editing</p>
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
      
      <div v-else class="flex-1 p-4 overflow-y-auto prose prose-sm max-w-none">
        <div v-html="renderedContent" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

const props = defineProps<{
  filePath?: string
}>()

const emit = defineEmits<{
  contentChange: [content: string]
}>()

const currentFile = ref(props.filePath)
const content = ref('')
const originalContent = ref('')
const showPreview = ref(false)
const saving = ref(false)
const hasUnsavedChanges = computed(() => content.value !== originalContent.value)

const renderedContent = computed(() => {
  if (!content.value) return ''
  return marked(content.value)
})

const loadFile = async (path: string) => {
  if (!path) return
  
  try {
    const response = await $fetch<{content: string, success: boolean}>(`/api/wiki/${path}`)
    if (response.success) {
      content.value = response.content
      originalContent.value = response.content
      currentFile.value = path
    }
  } catch (error) {
    console.error('Failed to load file:', error)
  }
}

const saveFile = async () => {
  if (!currentFile.value || !hasUnsavedChanges.value) return
  
  saving.value = true
  try {
    await $fetch(`/api/wiki/${currentFile.value}`, {
      method: 'PUT',
      body: { content: content.value }
    })
    originalContent.value = content.value
  } catch (error) {
    console.error('Failed to save file:', error)
  } finally {
    saving.value = false
  }
}

const handleContentChange = () => {
  emit('contentChange', content.value)
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 's') {
    event.preventDefault()
    saveFile()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

watch(() => props.filePath, (newPath) => {
  if (newPath) {
    loadFile(newPath)
  }
})

defineExpose({
  loadFile,
  saveFile
})
</script>