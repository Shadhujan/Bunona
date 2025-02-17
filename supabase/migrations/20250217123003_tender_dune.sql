/*
  # Fix user_stats foreign key relationship

  1. Changes
    - Add foreign key constraint to user_stats table
    - Update RLS policies to reflect the relationship

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access control
*/

-- Add foreign key constraint to user_stats table
ALTER TABLE user_stats
DROP CONSTRAINT IF EXISTS user_stats_user_id_fkey,
ADD CONSTRAINT user_stats_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Refresh RLS policies
ALTER TABLE user_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Recreate policies with proper relationship
DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
CREATE POLICY "Users can view own stats"
  ON user_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can update user stats" ON user_stats;
CREATE POLICY "System can update user stats"
  ON user_stats
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);