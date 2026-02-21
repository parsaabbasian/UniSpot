// Supabase Client for UniSpot Student Auth
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a hollow client if keys are missing to prevent crash, but log error
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        auth: {
            signInWithOtp: async () => ({ error: new Error("Supabase URL or Anon Key missing in Environment Variables.") }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            getSession: async () => ({ data: { session: null } }),
        }
    } as any;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("UNI-SPOT ERROR: Supabase environment variables are missing. Auth will not work.");
}
