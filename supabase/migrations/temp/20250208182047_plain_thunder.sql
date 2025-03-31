/*
  # Create user statistics system

  1. New Tables
    - `user_stats`
      - `user_id` (uuid, primary key, references auth.users)
      - `current_score` (integer)
      - `best_score` (integer)
      - `total_games` (integer)
      - `games_won` (integer)
      - `games_lost` (integer)
      - `win_loss_ratio` (decimal)
      - `last_played_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Functions
    - Function to calculate win/loss ratio
    - Function to update user stats after game completion
    - Function to initialize user stats

  3. Triggers
    - Trigger to update stats when a game is completed
    - Trigger to update the updated_at timestamp

  4. Security
    - Enable RLS
    - Add policies for read/write access
*/

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users,
  current_score integer DEFAULT 0,
  best_score integer DEFAULT 0,
  total_games integer DEFAULT 0,
  games_won integer DEFAULT 0,
  games_lost integer DEFAULT 0,
  win_loss_ratio decimal DEFAULT 0.0,
  last_played_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own stats"
  ON user_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can update user stats"
  ON user_stats
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to calculate win/loss ratio
CREATE OR REPLACE FUNCTION calculate_win_loss_ratio(wins integer, losses integer)
RETURNS decimal AS $$
BEGIN
  IF losses = 0 THEN
    RETURN CASE 
      WHEN wins > 0 THEN 1.0
      ELSE 0.0
    END;
  ELSE
    RETURN ROUND((wins::decimal / (wins + losses)::decimal)::decimal, 3);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update user stats after game
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS trigger AS $$
BEGIN
  -- Insert or update user stats
  INSERT INTO user_stats (
    user_id,
    current_score,
    best_score,
    total_games,
    games_won,
    games_lost,
    win_loss_ratio,
    last_played_at
  )
  VALUES (
    NEW.user_id,
    NEW.score,
    NEW.score,
    1,
    CASE WHEN NEW.score > 0 THEN 1 ELSE 0 END,
    CASE WHEN NEW.score = 0 THEN 1 ELSE 0 END,
    calculate_win_loss_ratio(
      CASE WHEN NEW.score > 0 THEN 1 ELSE 0 END,
      CASE WHEN NEW.score = 0 THEN 1 ELSE 0 END
    ),
    NEW.completed_at
  )
  ON CONFLICT (user_id) DO UPDATE SET
    current_score = NEW.score,
    best_score = GREATEST(user_stats.best_score, NEW.score),
    total_games = user_stats.total_games + 1,
    games_won = user_stats.games_won + CASE WHEN NEW.score > 0 THEN 1 ELSE 0 END,
    games_lost = user_stats.games_lost + CASE WHEN NEW.score = 0 THEN 1 ELSE 0 END,
    win_loss_ratio = calculate_win_loss_ratio(
      user_stats.games_won + CASE WHEN NEW.score > 0 THEN 1 ELSE 0 END,
      user_stats.games_lost + CASE WHEN NEW.score = 0 THEN 1 ELSE 0 END
    ),
    last_played_at = NEW.completed_at,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update stats after game completion
CREATE TRIGGER update_stats_after_game
  AFTER INSERT ON game_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS user_stats_best_score_idx ON user_stats(best_score DESC);
CREATE INDEX IF NOT EXISTS user_stats_win_loss_ratio_idx ON user_stats(win_loss_ratio DESC);
CREATE INDEX IF NOT EXISTS user_stats_last_played_idx ON user_stats(last_played_at DESC);

------------------------------------------------------
-------modified by me -----------------

ALTER TABLE user_stats
ADD COLUMN username text;

UPDATE user_stats u
SET username = p.username
FROM profiles p
WHERE u.user_id = p.id;

ALTER TABLE user_stats
ADD CONSTRAINT fk_user_stats_username
FOREIGN KEY (username)
REFERENCES profiles(username);

----------above i added username to user_stats table and added a foreign key to profiles table

CREATE POLICY "Public leaderboard view"
  ON user_stats
  FOR SELECT
  TO public
  USING (true);

  ----------above i added a policy to allow public to view the leaderboard

--------------------------------
CREATE OR REPLACE FUNCTION sync_username_to_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- UPSERT: insert a new row if one doesn't exist, otherwise update the username
  INSERT INTO user_stats (user_id, username, updated_at)
  VALUES (NEW.id, NEW.username, now())
  ON CONFLICT (user_id) DO UPDATE
    SET username = EXCLUDED.username,
        updated_at = now();
        
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
 -----------------above i added a function to sync username from profiles to user_stats table

DROP TRIGGER IF EXISTS trg_sync_username_on_profiles ON profiles;

CREATE TRIGGER trg_sync_username_on_profiles
AFTER INSERT OR UPDATE OF username ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_username_to_user_stats();

-----------------above i added a trigger to sync username from profiles to user_stats table

  CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_stats (
    user_id,
    current_score,
    best_score,
    total_games,
    games_won,
    games_lost,
    win_loss_ratio,
    last_played_at,
    username
  )
  VALUES (
    NEW.user_id,
    NEW.score,
    NEW.score,
    1,
    CASE WHEN NEW.score > 0 THEN 1 ELSE 0 END,
    CASE WHEN NEW.score = 0 THEN 1 ELSE 0 END,
    calculate_win_loss_ratio(
      CASE WHEN NEW.score > 0 THEN 1 ELSE 0 END,
      CASE WHEN NEW.score = 0 THEN 1 ELSE 0 END
    ),
    NEW.completed_at,
    COALESCE((SELECT username FROM profiles WHERE id = NEW.user_id), 'Player')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    current_score = NEW.score,
    best_score = GREATEST(user_stats.best_score, NEW.score),
    total_games = user_stats.total_games + 1,
    games_won = user_stats.games_won + CASE WHEN NEW.score > 0 THEN 1 ELSE 0 END,
    games_lost = user_stats.games_lost + CASE WHEN NEW.score = 0 THEN 1 ELSE 0 END,
    win_loss_ratio = calculate_win_loss_ratio(
      user_stats.games_won + CASE WHEN NEW.score > 0 THEN 1 ELSE 0 END,
      user_stats.games_lost + CASE WHEN NEW.score = 0 THEN 1 ELSE 0 END
    ),
    last_played_at = NEW.completed_at,
    updated_at = now(),
    username = COALESCE((SELECT username FROM profiles WHERE id = NEW.user_id), 'Player');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-------------------- above is for trigger when user game score will update into leaderboar with user name