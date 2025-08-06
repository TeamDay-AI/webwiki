export const useAuth = () => {
  const nuxtApp = useNuxtApp();
  const user = ref(null);
  const isLoading = ref(true); // Add loading state to prevent premature auth checks
  const apiSecretKey = ref<string | null>(null);

  // Get Supabase client safely
  const getSupabase = () => {
    if (!nuxtApp.$supabase) {
      throw new Error("Supabase client not initialized");
    }
    return nuxtApp.$supabase;
  };

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (data.user) {
      user.value = data.user;
      await getOrCreateApiUser(data.user);
    }
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (data.user) {
      await getOrCreateApiUser(data.user);
    }
    return { data, error };
  };

  const signOut = async () => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();
    user.value = null;
    apiSecretKey.value = null;
    // Clear stored API key
    if (process.client) {
      localStorage.removeItem("wiki-api-key");
    }
    return { error };
  };

  const getCurrentUser = async () => {
    const supabase = getSupabase();
    const { data } = await supabase.auth.getUser();
    user.value = data.user;
    if (data.user) {
      await getOrCreateApiUser(data.user);
    }
    isLoading.value = false; // Set loading to false after getting user
    return data.user;
  };

  // Get or create API user and store secret key
  const getOrCreateApiUser = async (supabaseUser: any) => {
    if (!supabaseUser?.id) return;

    try {
      // First try to get existing API user
      let response;
      try {
        response = await $fetch(`/api/auth/users/${supabaseUser.id}`);
      } catch (error: any) {
        if (error.status === 404) {
          // User doesn't exist, create one
          response = await $fetch("/api/auth/users", {
            method: "POST",
            body: {
              userId: supabaseUser.id,
              email: supabaseUser.email,
            },
          });
        } else {
          throw error;
        }
      }

      if (response?.user?.secretKey) {
        apiSecretKey.value = response.user.secretKey;
        // Store in localStorage for persistence
        if (process.client) {
          localStorage.setItem("wiki-api-key", response.user.secretKey);
        }
      }
    } catch (error) {
      console.error("Failed to get or create API user:", error);
    }
  };

  // Load stored API key on initialization
  const loadStoredApiKey = () => {
    if (process.client) {
      const stored = localStorage.getItem("wiki-api-key");
      if (stored) {
        apiSecretKey.value = stored;
      }
    }
  };

  // Create authenticated $fetch wrapper
  const $fetchWithAuth = async (url: string, options: any = {}) => {
    const headers = options.headers || {};

    if (apiSecretKey.value) {
      headers.Authorization = `Bearer ${apiSecretKey.value}`;
    }

    return $fetch(url, {
      ...options,
      headers,
    });
  };

  // Initialize auth state immediately on client side
  if (process.client) {
    // Check for existing session immediately
    const initializeAuth = async () => {
      try {
        const supabase = getSupabase();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        user.value = session?.user || null;
        if (session?.user) {
          await getOrCreateApiUser(session.user);
        }
        isLoading.value = false;

        // Set up auth state change listener
        supabase.auth.onAuthStateChange(async (event: string, session: any) => {
          user.value = session?.user || null;
          if (session?.user) {
            await getOrCreateApiUser(session.user);
          } else {
            apiSecretKey.value = null;
            if (process.client) {
              localStorage.removeItem("wiki-api-key");
            }
          }
          isLoading.value = false;
        });
      } catch (error) {
        console.error("Auth initialization error:", error);
        isLoading.value = false;
      }
    };

    // Initialize immediately, not waiting for mount
    initializeAuth();
    // Load stored API key
    loadStoredApiKey();
  }

  return {
    user: readonly(user),
    isLoading: readonly(isLoading),
    apiSecretKey: readonly(apiSecretKey),
    signIn,
    signUp,
    signOut,
    getCurrentUser,
    $fetchWithAuth,
  };
};
