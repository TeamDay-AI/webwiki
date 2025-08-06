<template>
  <div class="h-screen flex flex-col">
    <!-- Header -->
    <header
      class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4"
    >
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Wiki
        </h1>

        <div class="flex items-center space-x-4">
          <span v-if="user" class="text-sm text-gray-600 dark:text-gray-400">
            Welcome, {{ user.email }}
          </span>
          <ColorModeSelector />
          <ThemeSelector />
          <CButton
            v-if="user"
            color="gray"
            variant="ghost"
            @click="handleSignOut"
          >
            Sign Out
          </CButton>
          <CButton v-else @click="showAuthModal = true"> Sign In </CButton>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Panel - Navigation -->
      <div class="w-64 flex-shrink-0">
        <WikiNavigation @select-file="handleFileSelect" />
      </div>

      <!-- Center Panel - Document Viewer -->
      <div class="flex-1">
        <DocumentViewer
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
    <CModal v-model="showAuthModal">
      <CCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ authMode === "signin" ? "Sign In" : "Sign Up" }}
          </h3>
        </template>

        <CForm :state="authForm" @submit="handleAuth">
          <div class="space-y-4">
            <CFormGroup label="Email" name="email">
              <CInput
                v-model="authForm.email"
                type="email"
                placeholder="your@email.com"
                required
              />
            </CFormGroup>

            <CFormGroup label="Password" name="password">
              <CInput
                v-model="authForm.password"
                type="password"
                placeholder="Your password"
                required
              />
            </CFormGroup>
          </div>

          <div class="flex flex-col gap-2 mt-6">
            <CButton type="submit" :loading="authLoading" block>
              {{ authMode === "signin" ? "Sign In" : "Sign Up" }}
            </CButton>

            <CButton color="gray" variant="ghost" @click="toggleAuthMode" block>
              {{
                authMode === "signin"
                  ? "Need an account? Sign up"
                  : "Have an account? Sign in"
              }}
            </CButton>
          </div>
        </CForm>
      </CCard>
    </CModal>
  </div>
</template>

<script setup lang="ts">
const { user, isLoading, signIn, signUp, signOut } = useAuth();

const selectedFile = ref<string>();
const currentContent = ref<string>("");
const showAuthModal = ref(false);
const authLoading = ref(false);
const authMode = ref<"signin" | "signup">("signin");

const authForm = reactive({
  email: "",
  password: "",
});

const handleFileSelect = (filePath: string) => {
  selectedFile.value = filePath;

  // Update URL to reflect the file path (remove user ID for clean URLs)
  const cleanPath = filePath.replace(/^users\/[^/]+\//, "");
  if (cleanPath) {
    navigateTo(`/wiki/${cleanPath}`, { replace: true });
  }
};

const handleContentChange = (content: string) => {
  currentContent.value = content;
};

const handleAuth = async () => {
  authLoading.value = true;
  try {
    const { error, data } =
      authMode.value === "signin"
        ? await signIn(authForm.email, authForm.password)
        : await signUp(authForm.email, authForm.password);

    if (error) {
      console.error("Auth error:", error);
      return;
    }

    // Initialize user directory if this is a new signup
    if (authMode.value === "signup" && data.user) {
      try {
        const { $fetchWithAuth } = useAuth();
        await $fetchWithAuth("/api/wiki/init-user", {
          method: "POST",
          body: { userId: data.user.id },
        });
      } catch (initError) {
        console.warn("Failed to initialize user directory:", initError);
      }
    }

    showAuthModal.value = false;
    authForm.email = "";
    authForm.password = "";
  } catch (error) {
    console.error("Auth error:", error);
  } finally {
    authLoading.value = false;
  }
};

const handleSignOut = async () => {
  await signOut();
  selectedFile.value = undefined;
  currentContent.value = "";
};

const toggleAuthMode = () => {
  authMode.value = authMode.value === "signin" ? "signup" : "signin";
};

// Redirect to welcome file or auth modal (but only after loading is complete)
watch(
  [user, isLoading],
  async ([newUser, loading]) => {
    if (loading) return; // Don't show auth modal while still loading

    if (!newUser) {
      showAuthModal.value = true;
    } else if (newUser) {
      // Ensure user directory exists for existing users
      try {
        await $fetch("/api/wiki/init-user", {
          method: "POST",
          body: { userId: newUser.id },
        });
      } catch (error) {
        // Ignore errors - the API will handle missing directories on-demand
        console.warn("Could not pre-initialize user directory:", error);
      }

      // No automatic redirect - user can navigate manually
    }
  },
  { immediate: true }
);
</script>
