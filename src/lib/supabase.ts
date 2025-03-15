/**
 * Creates a Supabase client instance using the provided URL and anonymous key.
 * 
 * @constant {SupabaseClient} supabase - The Supabase client instance.
 * @param {string} supabaseUrl - The URL of the Supabase instance.
 * @param {string} supabaseAnonKey - The anonymous key for the Supabase instance.
*/

import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey);