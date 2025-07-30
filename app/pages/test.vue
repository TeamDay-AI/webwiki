<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Configuration Test</h1>
    
    <div class="space-y-4">
      <!-- Client-side configs -->
      <div class="bg-blue-50 p-4 rounded">
        <h3 class="font-semibold mb-2">Client Configuration</h3>
        <div>
          <strong>Supabase URL:</strong> 
          <span class="font-mono">{{ config.public.supabaseUrl || 'NOT SET' }}</span>
        </div>
        <div>
          <strong>Supabase Key:</strong> 
          <span class="font-mono">{{ config.public.supabaseAnonKey ? '***SET***' : 'NOT SET' }}</span>
        </div>
        <div>
          <strong>Supabase Client:</strong> 
          <span :class="supabaseStatus.color">{{ supabaseStatus.text }}</span>
        </div>
      </div>

      <!-- Server-side test -->
      <div class="bg-green-50 p-4 rounded">
        <h3 class="font-semibold mb-2">Server Configuration</h3>
        <div v-if="pending">Loading server config...</div>
        <div v-else-if="error" class="text-red-600">Error: {{ error }}</div>
        <div v-else>
          <div>
            <strong>AWS Region:</strong> 
            <span class="font-mono">{{ serverConfig?.awsRegion || 'NOT SET' }}</span>
          </div>
          <div>
            <strong>S3 Bucket:</strong> 
            <span class="font-mono">{{ serverConfig?.s3BucketName || 'NOT SET' }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mt-8">
      <CButton @click="testS3Connection" :loading="testingS3">Test S3 Connection</CButton>
      <CButton @click="navigateTo('/')" class="ml-4">Back to Home</CButton>
    </div>

    <div v-if="s3TestResult" class="mt-4 p-4 rounded" :class="s3TestResult.success ? 'bg-green-50' : 'bg-red-50'">
      <strong>S3 Test Result:</strong> {{ s3TestResult.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const { $supabase } = useNuxtApp()

const supabaseStatus = computed(() => {
  if ($supabase) {
    return { text: 'Connected', color: 'text-green-600' }
  } else {
    return { text: 'Not Connected', color: 'text-red-600' }
  }
})

// Fetch server config
const { data: serverConfig, pending, error } = await useFetch('/api/test/config')

// S3 test
const testingS3 = ref(false)
const s3TestResult = ref(null)

const testS3Connection = async () => {
  testingS3.value = true
  try {
    const result = await $fetch('/api/test/s3')
    s3TestResult.value = result
  } catch (error: any) {
    s3TestResult.value = { success: false, message: error.data?.message || 'S3 connection failed' }
  } finally {
    testingS3.value = false
  }
}
</script>