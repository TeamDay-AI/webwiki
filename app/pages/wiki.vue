<template>
  <div class="h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Wiki</h1>
        
        <div class="flex items-center space-x-4">
          <span v-if="user" class="text-sm text-gray-600">
            Welcome, {{ user.email }}
          </span>
          <UButton
            v-if="user"
            color="gray"
            variant="ghost"
            @click="handleSignOut"
          >
            Sign Out
          </UButton>
          <UButton
            v-else
            @click="showAuthModal = true"
          >
            Sign In
          </UButton>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Panel - Navigation -->
      <div class="w-64 flex-shrink-0">
        <WikiNavigation @select-file="handleFileSelect" />
      </div>

      <!-- Center Panel - Editor -->
      <div class="flex-1">
        <MarkdownEditor 
          :file-path="selectedFile" 
          @content-change="handleContentChange"
        />
      </div>

      <!-- Right Panel - Table of Contents -->
      <div class="w-64 flex-shrink-0">
        <TableOfContents :content="currentContent" />
      </div>
    </div>

    <!-- Auth Modal -->
    <UModal v-model="showAuthModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ authMode === 'signin' ? 'Sign In' : 'Sign Up' }}
          </h3>
        </template>
        
        <UForm :state="authForm" @submit="handleAuth">
          <div class="space-y-4">
            <UFormGroup label="Email" name="email">
              <UInput 
                v-model="authForm.email" 
                type="email"
                placeholder="your@email.com"
                required
              />
            </UFormGroup>
            
            <UFormGroup label="Password" name="password">
              <UInput 
                v-model="authForm.password" 
                type="password"
                placeholder="Your password"
                required
              />
            </UFormGroup>
          </div>
          
          <div class="flex flex-col gap-2 mt-6">
            <UButton type="submit" :loading="authLoading" block>
              {{ authMode === 'signin' ? 'Sign In' : 'Sign Up' }}
            </UButton>
            
            <UButton 
              color="gray" 
              variant="ghost" 
              @click="toggleAuthMode"
              block
            >
              {{ authMode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in' }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const { user, signIn, signUp, signOut } = useAuth()

const selectedFile = ref<string>()
const currentContent = ref<string>('')
const showAuthModal = ref(false)
const authLoading = ref(false)
const authMode = ref<'signin' | 'signup'>('signin')

const authForm = reactive({
  email: '',
  password: ''
})

const handleFileSelect = (filePath: string) => {
  selectedFile.value = filePath
}

const handleContentChange = (content: string) => {
  currentContent.value = content
}

const handleAuth = async () => {
  authLoading.value = true
  try {
    const { error } = authMode.value === 'signin' 
      ? await signIn(authForm.email, authForm.password)
      : await signUp(authForm.email, authForm.password)
    
    if (error) {
      console.error('Auth error:', error)
      return
    }
    
    showAuthModal.value = false
    authForm.email = ''
    authForm.password = ''
  } catch (error) {
    console.error('Auth error:', error)
  } finally {
    authLoading.value = false
  }
}

const handleSignOut = async () => {
  await signOut()
  selectedFile.value = undefined
  currentContent.value = ''
}

const toggleAuthMode = () => {
  authMode.value = authMode.value === 'signin' ? 'signup' : 'signin'
}

// Redirect to auth if not authenticated
watch(user, (newUser) => {
  if (!newUser) {
    showAuthModal.value = true
  }
}, { immediate: true })
</script>