export const useAuth = () => {
  const nuxtApp = useNuxtApp();
  const user = ref(null);
  const isLoading = ref(true); // Add loading state to prevent premature auth checks

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
    if (data.user) user.value = data.user;
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();
    user.value = null;
    return { error };
  };

  const getCurrentUser = async () => {
    const supabase = getSupabase();
    const { data } = await supabase.auth.getUser();
    user.value = data.user;
    isLoading.value = false; // Set loading to false after getting user
    return data.user;
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
        isLoading.value = false;

        // Set up auth state change listener
        supabase.auth.onAuthStateChange((event: string, session: any) => {
          user.value = session?.user || null;
          isLoading.value = false;
        });
      } catch (error) {
        console.error("Auth initialization error:", error);
        isLoading.value = false;
      }
    };

    // Initialize immediately, not waiting for mount
    initializeAuth();
  }

  return {
    user: readonly(user),
    isLoading: readonly(isLoading),
    signIn,
    signUp,
    signOut,
    getCurrentUser,
  };
};
