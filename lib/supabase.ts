import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;

// Initialize from stored settings on app boot
export const initSupabaseFromStorage = async () => {
  try {
    const stored = await AsyncStorage.getItem('luxe_global_settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.supabaseUrl && parsed.supabaseKey) {
        await initSupabase(parsed.supabaseUrl, parsed.supabaseKey);
        console.log('[Supabase] Initialized from stored settings');
      }
    }
  } catch (e) {
    console.error('[Supabase] Error booting from storage:', e);
  }
};

// Runtime initializer for Admin settings
export const initSupabase = async (url: string, key: string) => {
  if (url && key) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          storage: AsyncStorage as any,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      });
      console.log('[Supabase] Client initialized from runtime settings');
    } catch (e) {
      console.error('[Supabase] Failed to initialize client:', e);
    }
  }
};

// Accessor for the client instance
export const getSupabase = () => supabaseInstance;

// Direct export for simpler usage, though it might be null initially
export const supabase = supabaseInstance;
