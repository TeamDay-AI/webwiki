<template>
  <div class="h-screen flex flex-col">
    <!-- Header -->
    <header
      class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-2"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Wiki
          </h1>
          <div
            v-if="currentPath"
            class="flex items-center text-sm text-gray-500"
          >
            <span class="mx-2">/</span>
            <div class="flex items-center space-x-1">
              <span
                v-for="(segment, index) in pathSegments"
                :key="index"
                class="flex items-center"
              >
                <CButton
                  v-if="index < pathSegments.length - 1"
                  size="xs"
                  color="gray"
                  variant="ghost"
                  @click="navigateToSegment(index)"
                  class="px-2 py-1 hover:bg-gray-100"
                >
                  {{ segment }}
                </CButton>
                <span v-else class="font-medium text-gray-700 px-2">{{
                  segment
                }}</span>
                <span
                  v-if="index < pathSegments.length - 1"
                  class="mx-1 text-gray-400"
                  >/</span
                >
              </span>
            </div>
          </div>
        </div>

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
const route = useRoute();

const selectedFile = ref<string>();
const currentContent = ref<string>("");
const showAuthModal = ref(false);
const authLoading = ref(false);
const authMode = ref<"signin" | "signup">("signin");

const authForm = reactive({
  email: "",
  password: "",
});

// Get the current path from URL
const currentPath = computed(() => {
  const pathParam = route.params.path;
  if (Array.isArray(pathParam)) {
    return pathParam.join("/");
  }
  return pathParam || "";
});

// Path segments for breadcrumb navigation
const pathSegments = computed(() => {
  if (!currentPath.value) return [];
  return currentPath.value.split("/").filter(Boolean);
});

// Navigate to a specific path segment (for breadcrumb navigation)
const navigateToSegment = (index: number) => {
  const segments = pathSegments.value.slice(0, index + 1);
  const newPath = segments.join("/");
  if (newPath) {
    navigateTo(`/wiki/${newPath}`);
  } else {
    navigateTo("/wiki");
  }
};

const handleFileSelect = (filePath: string) => {
  selectedFile.value = filePath;

  // Update URL to reflect the file path (remove user ID for clean URLs)
  const cleanPath = filePath.replace(/^users\/[^/]+\//, "");
  if (cleanPath && cleanPath !== currentPath.value) {
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
        await $fetch("/api/wiki/init-user", {
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
  navigateTo("/wiki");
};

const toggleAuthMode = () => {
  authMode.value = authMode.value === "signin" ? "signup" : "signin";
};

// Handle URL-based file selection (but only after loading is complete)
watch(
  [user, currentPath, isLoading],
  async ([newUser, newPath, loading]) => {
    if (loading) return; // Don't show auth modal while still loading

    if (!newUser) {
      showAuthModal.value = true;
      return;
    }

    if (newUser && newPath) {
      // Convert URL path to full file path with user ID
      const fullPath = `users/${newUser.id}/${newPath}`;
      selectedFile.value = fullPath;
    } else if (newUser && !selectedFile.value) {
      // Ensure user directory exists for existing users
      try {
        await $fetch("/api/wiki/init-user", {
          method: "POST",
          body: { userId: newUser.id },
        });
      } catch (error) {
        console.warn("Could not pre-initialize user directory:", error);
      }

      // User can navigate manually - no automatic file selection
    }
  },
  { immediate: true }
);
</script>
