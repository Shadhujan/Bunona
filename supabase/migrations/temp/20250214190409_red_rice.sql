/*
  # Add Daily Challenge Support

  1. New Tables
    - `daily_challenge_scores`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `score` (integer)
      - `challenge_date` (date)
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `daily_challenge_scores` table
    - Add policies for authenticated users to:
      - Insert their own scores
      - Read all scores for leaderboard
*/

CREATE TABLE IF NOT EXISTS daily_challenge_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  score integer NOT NULL,
  challenge_date date NOT NULL,
  completed_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_challenge_scores ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own scores
CREATE POLICY "Users can insert own scores"
  ON daily_challenge_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow all authenticated users to read scores (for leaderboard)
CREATE POLICY "Users can read all scores"
  ON daily_challenge_scores
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS daily_challenge_scores_user_date_idx 
  ON daily_challenge_scores(user_id, challenge_date);
CREATE INDEX IF NOT EXISTS daily_challenge_scores_date_score_idx 
  ON daily_challenge_scores(challenge_date, score DESC);