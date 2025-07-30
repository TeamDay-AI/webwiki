export const useAuth = () => {
  const nuxtApp = useNuxtApp()
  const user = ref(null)

  // Get Supabase client safely
  const getSupabase = () => {
    if (!nuxtApp.$supabase) {
      throw new Error('Supabase client not initialized')
    }
    return nuxtApp.$supabase
  }

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (data.user) user.value = data.user
    return { data, error }
  }

  const signUp = async (email: string, password: string) => {
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    return { data, error }
  }

  const signOut = async () => {
    const supabase = getSupabase()
    const { error } = await supabase.auth.signOut()
    user.value = null
    return { error }
  }

  const getCurrentUser = async () => {
    const supabase = getSupabase()
    const { data } = await supabase.auth.getUser()
    user.value = data.user
    return data.user
  }

  // Only run on client side
  if (process.client) {
    onMounted(() => {
      getCurrentUser()
      
      const supabase = getSupabase()
      supabase.auth.onAuthStateChange((event: string, session: any) => {
        user.value = session?.user || null
      })
    })
  }

  return {
    user: readonly(user),
    signIn,
    signUp,
    signOut,
    getCurrentUser
  }
}