<template>
  <div class="h-full bg-gray-50 border-l border-gray-200 overflow-y-auto">
    <div class="p-4">
      <h3 class="text-sm font-semibold text-gray-900 mb-4">Table of Contents</h3>
      
      <div v-if="!headings.length" class="text-sm text-gray-500">
        No headings found in the current document.
      </div>
      
      <nav v-else class="space-y-1">
        <a
          v-for="heading in headings"
          :key="heading.id"
          :href="`#${heading.id}`"
          :class="[
            'block text-sm hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded',
            `pl-${(heading.level - 1) * 2 + 2}`,
            'text-gray-700'
          ]"
          @click="scrollToHeading(heading.id)"
        >
          {{ heading.text }}
        </a>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Heading {
  id: string
  text: string
  level: number
}

const props = defineProps<{
  content?: string
}>()

const headings = ref<Heading[]>([])

const generateId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim()
}

const extractHeadings = (markdownContent: string): Heading[] => {
  if (!markdownContent) return []
  
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const extracted: Heading[] = []
  let match
  
  while ((match = headingRegex.exec(markdownContent)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = generateId(text)
    
    extracted.push({
      id,
      text,
      level
    })
  }
  
  return extracted
}

const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

watch(() => props.content, (newContent) => {
  headings.value = extractHeadings(newContent || '')
}, { immediate: true })
</script>

<style scoped>
.pl-2 { padding-left: 0.5rem; }
.pl-4 { padding-left: 1rem; }
.pl-6 { padding-left: 1.5rem; }
.pl-8 { padding-left: 2rem; }
.pl-10 { padding-left: 2.5rem; }
.pl-12 { padding-left: 3rem; }
</style>