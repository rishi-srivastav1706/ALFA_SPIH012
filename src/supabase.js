import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Check if credentials are valid and not placeholders
const isConfigured = supabaseUrl && supabaseAnonKey && 
                     supabaseUrl !== "PLACEHOLDER" && 
                     supabaseAnonKey !== "PLACEHOLDER";

const makeMockSupabase = () => {
  console.warn("Supabase is NOT configured. Running in localStorage fallback mode.");

  // Chainable query builder mock
  const chainBuilder = {
    select: () => chainBuilder,
    insert: () => chainBuilder,
    update: () => chainBuilder,
    delete: () => chainBuilder,
    eq: () => chainBuilder,
    in: () => chainBuilder,
    order: () => chainBuilder,
    single: () => chainBuilder,
    then: (resolve) => {
      resolve({ data: null, error: new Error("Supabase is not configured.") });
      return chainBuilder;
    }
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: async () => ({ data: { user: null }, error: new Error("Supabase not configured") }),
      signInWithPassword: async () => ({ data: { user: null }, error: new Error("Supabase not configured") }),
      signOut: async () => ({ error: null })
    },
    from: () => chainBuilder
  };
};

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : makeMockSupabase();
