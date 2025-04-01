/*
  # Create game scores table

  1. New Tables
    - `game_scores`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `score` (integer)
      - `difficulty` (text)
      - `completed_at` (timestamp with time zone)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `game_scores` table
    - Add policies for:
      - Users can insert their own scores
      - Users can read all scores (for leaderboard)
*/

CREATE TABLE IF NOT EXISTS game_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  score integer NOT NULL,
  difficulty text NOT NULL,
  completed_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own scores
CREATE POLICY "Users can insert own scores"
  ON game_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow all authenticated users to read scores (for leaderboard)
CREATE POLICY "Users can read all scores"
  ON game_scores
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index for faster leaderboard queries
CREATE INDEX IF NOT EXISTS game_scores_user_id_idx ON game_scores(user_id);
CREATE INDEX IF NOT EXISTS game_scores_score_idx ON game_scores(score DESC);