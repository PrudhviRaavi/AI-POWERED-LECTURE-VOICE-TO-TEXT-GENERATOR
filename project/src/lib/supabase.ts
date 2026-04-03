import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export type Lecture = {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  duration: number;
  audio_url: string | null;
  status: 'recording' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
};

export type Note = {
  id: string;
  lecture_id: string;
  user_id: string;
  transcription: string;
  ai_summary: string;
  key_points: string[];
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
};
