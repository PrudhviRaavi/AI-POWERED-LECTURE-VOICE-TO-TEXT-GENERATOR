/*
  # Lecture Voice-to-Notes Generator Database Schema

  ## Overview
  This migration creates the complete database schema for an AI-powered lecture note-taking application.
  
  ## New Tables
  
  ### `lectures`
  Stores information about recorded lectures
  - `id` (uuid, primary key) - Unique identifier for each lecture
  - `user_id` (uuid) - References the authenticated user who created the lecture
  - `title` (text) - Title of the lecture
  - `subject` (text) - Subject/category of the lecture
  - `duration` (integer) - Duration of the recording in seconds
  - `audio_url` (text, nullable) - URL to the stored audio file (if applicable)
  - `status` (text) - Status: 'recording', 'processing', 'completed', 'failed'
  - `created_at` (timestamptz) - Timestamp when the lecture was created
  - `updated_at` (timestamptz) - Timestamp of last update
  
  ### `notes`
  Stores the generated notes and transcriptions
  - `id` (uuid, primary key) - Unique identifier for each note
  - `lecture_id` (uuid) - References the parent lecture
  - `user_id` (uuid) - References the authenticated user
  - `transcription` (text) - Raw transcription from speech-to-text
  - `ai_summary` (text) - AI-generated summary of the lecture
  - `key_points` (jsonb) - Array of key points extracted by AI
  - `content` (text) - User-editable note content
  - `tags` (text[]) - Array of tags for categorization
  - `created_at` (timestamptz) - Timestamp when the note was created
  - `updated_at` (timestamptz) - Timestamp of last update
  
  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Users can only access their own lectures and notes
  - Policies enforce authentication and ownership checks
  
  ## Important Notes
  1. All timestamps use `timestamptz` for timezone awareness
  2. Foreign key constraints ensure data integrity
  3. Indexes on user_id and lecture_id for query performance
  4. Default values prevent null-related errors
*/

-- Create lectures table
CREATE TABLE IF NOT EXISTS lectures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  subject text DEFAULT '',
  duration integer DEFAULT 0,
  audio_url text,
  status text DEFAULT 'recording',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id uuid NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  transcription text DEFAULT '',
  ai_summary text DEFAULT '',
  key_points jsonb DEFAULT '[]'::jsonb,
  content text DEFAULT '',
  tags text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lectures_user_id ON lectures(user_id);
CREATE INDEX IF NOT EXISTS idx_lectures_created_at ON lectures(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_lecture_id ON notes(lecture_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);

-- Enable Row Level Security
ALTER TABLE lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lectures table
CREATE POLICY "Users can view own lectures"
  ON lectures FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lectures"
  ON lectures FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lectures"
  ON lectures FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own lectures"
  ON lectures FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for notes table
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);