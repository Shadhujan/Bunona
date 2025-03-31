/**
 * Retrieves the daily challenge status for a given user.
 *
 * @param userId - The ID of the user to retrieve the daily challenge status for.
 * @returns A promise that resolves to an object containing the daily challenge status.
 *
 * The returned object contains the following properties:
 * - `isAvailable`: A boolean indicating if the daily challenge is available.
 * - `nextAvailableAt`: A string representing the next available time for the daily challenge in ISO format, or null if available.
 * - `lastCompletedAt`: A string representing the last completion time of the daily challenge in ISO format, or null if not completed today.
 * - `highestScore`: The highest score achieved by the user in the daily challenges.
 * - `currentStreak`: The current streak of consecutive days the user has completed the daily challenge.
 *
 * The function performs the following steps:
 * 1. Converts the current time to Sri Lanka timezone.
 * 2. Retrieves the last completed challenge for today from the `daily_challenge_scores` table.
 * 3. Retrieves the current streak of consecutive days the user has completed the daily challenge.
 * 4. Retrieves the highest score achieved by the user in the daily challenges.
 * 5. Calculates the next available time for the daily challenge (midnight Sri Lanka time).
 * 6. Returns the daily challenge status.
 *
 * If an error occurs during any of the database operations, the function logs the error and returns a default status indicating the challenge is not available.
 *
 * @returns A promise that resolves to a `DailyChallenge` object containing the status of the daily challenge.
 */


import { supabase } from './supabase'; // Importing the supabase client for database operations

// Interface defining the structure of user statistics
export interface UserStats {
  currentScore: number;
  bestScore: number;
  totalGames: number;
  gamesWon: number;
  gamesLost: number;
  winLossRatio: number;
  lastPlayedAt: string | null;
}

// Interface defining the structure of daily challenge status
export interface DailyChallenge {
  isAvailable: boolean;
  nextAvailableAt: string | null;
  lastCompletedAt: string | null;
  highestScore: number;
  currentStreak: number;
}

// Function to get user statistics from the database
export async function getUserStats(userId: string): Promise<UserStats | null> {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      // Using maybeSingle to return null if no data is found
    // This is useful for handling cases where the user might not have any stats yet
    // or if the user ID is invalid.
    if (error) throw error; // Throw error if any

    if (!data) return null; // Return null if no data found

    // Mapping database fields to UserStats interface
    return {
      currentScore: data.current_score,
      bestScore: data.best_score,
      totalGames: data.total_games,
      gamesWon: data.games_won,
      gamesLost: data.games_lost,
      winLossRatio: data.win_loss_ratio,
      lastPlayedAt: data.last_played_at,
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }
}

// Function to get the leaderboard from the database
export async function getLeaderboard(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select(`
        user_id,
        best_score,
        games_won,
        win_loss_ratio,
        username
      `) // Selecting specific columns
      .order('best_score', { ascending: false }) // Ordering by best score in descending order
      .limit(limit); // Limiting the number of results

    if (error) throw error; // Throw error if any

    console.log(data);

    // Mapping database fields to a more readable format
    return data.map((entry) => ({
      userId: entry.user_id,
      username: entry.username,
      bestScore: entry.best_score,
      gamesWon: entry.games_won,
      winLossRatio: entry.win_loss_ratio,
    }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

export async function getDailyChallengeStatus(userId: string): Promise<DailyChallenge> {
  try {
    // Convert to Sri Lanka timezone
    const sriLankaTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' });
    const today = new Date(sriLankaTime).toISOString().split('T')[0];
    
    // Get the last completed challenge for today
    const { data: lastChallenges, error: challengeError } = await supabase
      .from('daily_challenge_scores') // Querying the 'daily_challenge_scores' table
      .select('*') // Selecting all columns
      .eq('user_id', userId) // Filtering by user ID
      .eq('challenge_date', today) // Filtering by today's date
      .order('completed_at', { ascending: false }) // Ordering by completion time in descending order
      .limit(1); // Limiting to the most recent entry

    if (challengeError) {
      console.error('Error fetching last challenge:', challengeError);
      throw challengeError;
    }

    // Get the current streak
    const { data: streakData, error: streakError } = await supabase
      .from('daily_challenge_scores') // Querying the 'daily_challenge_scores' table
      .select('challenge_date, score') // Selecting challenge date and score
      .eq('user_id', userId) // Filtering by user ID
      .order('challenge_date', { ascending: false }); // Ordering by challenge date in descending order

    if (streakError) {
      console.error('Error fetching streak data:', streakError);
      throw streakError;
    }

    // Calculate current streak
    let currentStreak = 0;
    if (streakData && streakData.length > 0) {
      const dates = streakData.map(d => new Date(d.challenge_date));
      const scores = streakData.map(d => d.score);
      
      for (let i = 0; i < dates.length; i++) {
        if (scores[i] === 0) break; // Break streak on zero score
        
        if (i === 0) {
          currentStreak++;
          continue;
        }
        
        // Check if dates are consecutive
        const diff = Math.abs(dates[i - 1].getTime() - dates[i].getTime());
        if (diff <= 86400000) { // 24 hours in milliseconds
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Get the highest score
    const { data: highScores, error: scoreError } = await supabase
      .from('daily_challenge_scores') // Querying the 'daily_challenge_scores' table
      .select('score') // Selecting the score column
      .eq('user_id', userId) // Filtering by user ID
      .order('score', { ascending: false }) // Ordering by score in descending order
      .limit(1); // Limiting to the highest score

    if (scoreError) {
      console.error('Error fetching high scores:', scoreError);
      throw scoreError;
    }

    const lastChallenge = lastChallenges?.[0];
    const highestScore = highScores?.[0]?.score || 0;

    // If there's no challenge completed today, it's available
    if (!lastChallenge) {
      return {
        isAvailable: true,
        nextAvailableAt: null,
        lastCompletedAt: null,
        highestScore,
        currentStreak
      };
    }

    // Calculate next available time (midnight Sri Lanka time)
    const lastCompletedAt = new Date(lastChallenge.completed_at);
    const nextAvailable = new Date(sriLankaTime);
    nextAvailable.setHours(24, 0, 0, 0); // Set to next midnight in Sri Lanka time

    const now = new Date(sriLankaTime);
    const isAvailable = now >= nextAvailable;

    return {
      isAvailable,
      nextAvailableAt: isAvailable ? null : nextAvailable.toISOString(),
      lastCompletedAt: lastChallenge.completed_at,
      highestScore,
      currentStreak
    };
  } catch (error) {
    console.error('Error checking daily challenge status:', error);
    return {
      isAvailable: false,
      nextAvailableAt: null,
      lastCompletedAt: null,
      highestScore: 0,
      currentStreak: 0
    };
  }
}
