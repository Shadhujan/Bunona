import { supabase } from './supabase';

export interface UserStats {
  currentScore: number;
  bestScore: number;
  totalGames: number;
  gamesWon: number;
  gamesLost: number;
  winLossRatio: number;
  lastPlayedAt: string | null;
}

export interface DailyChallenge {
  isAvailable: boolean;
  nextAvailableAt: string | null;
  lastCompletedAt: string | null;
  highestScore: number;
  currentStreak: number;
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    if (!data) return null;

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

export async function getLeaderboard(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select(`
        user_id,
        best_score,
        games_won,
        win_loss_ratio,
        profiles (username)
      `)
      .order('best_score', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map((entry) => ({
      userId: entry.user_id,
      username: entry.profiles?.username,
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
      .from('daily_challenge_scores')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_date', today)
      .order('completed_at', { ascending: false })
      .limit(1);

    if (challengeError) {
      console.error('Error fetching last challenge:', challengeError);
      throw challengeError;
    }

    // Get the current streak
    const { data: streakData, error: streakError } = await supabase
      .from('daily_challenge_scores')
      .select('challenge_date, score')
      .eq('user_id', userId)
      .order('challenge_date', { ascending: false });

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
      .from('daily_challenge_scores')
      .select('score')
      .eq('user_id', userId)
      .order('score', { ascending: false })
      .limit(1);

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