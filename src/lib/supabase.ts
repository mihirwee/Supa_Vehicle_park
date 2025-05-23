import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

// Ensure you set up these environment variables in your project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single supabase client for the entire app
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Profile and vehicle types based on Supabase tables
export type Profile = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
};

export type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  type: string;
  user_id: string;
  created_at: string;
};
