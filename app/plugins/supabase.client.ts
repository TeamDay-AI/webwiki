import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  // Check if required config is available
  if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
    console.warn('Supabase configuration missing. Please check your .env file.')
    return {
      provide: {
        supabase: null
      }
    }
  }
  
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  )

  return {
    provide: {
      supabase
    }
  }
})