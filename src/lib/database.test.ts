import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getLeaderboard } from './database';
import { supabase } from './supabase';

// Mock Supabase client
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('getLeaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and transform leaderboard data correctly', async () => {
    /**
     * Mock data representing user statistics.
     * 
     * @constant
     * @type {Array<Object>}
     * 
     * @property {string} user_id - Unique identifier for the user.
     * @property {number} best_score - The highest score achieved by the user.
     * @property {number} games_won - The number of games won by the user.
     * @property {number} win_loss_ratio - The ratio of wins to losses for the user.
     * @property {Object} profiles - An object containing user profile information.
     * @property {string} profiles.username - The username of the user.
     */
    const mockData = [
      {
        user_id: '123',
        best_score: 100,
        games_won: 5,
        win_loss_ratio: 0.8,
        profiles: { username: 'player1' },
      },
    ];

    const mockSelect = vi.fn().mockResolvedValue({ data: mockData, error: null });
    const mockOrder = vi.fn().mockReturnValue({ limit: vi.fn().mockReturnValue({ select: mockSelect }) });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      order: mockOrder,
    } as any);

    const result = await getLeaderboard(1);

    expect(result).toEqual([
      {
        userId: '123',
        username: 'player1',
        bestScore: 100,
        gamesWon: 5,
        winLossRatio: 0.8,
      },
    ]);

    expect(supabase.from).toHaveBeenCalledWith('user_stats');
    expect(mockSelect).toHaveBeenCalledWith(`
      user_id,
      best_score,
      games_won,
      win_loss_ratio,
      profiles!user_stats_user_id_fkey (username)
    `);
  });

  it('should handle errors gracefully', async () => {
    const mockError = new Error('Database error');
    const mockSelect = vi.fn().mockResolvedValue({ data: null, error: mockError });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as any);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    const result = await getLeaderboard();

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching leaderboard:', mockError);

    consoleSpy.mockRestore();
  });

  it('should handle missing profile data', async () => {
    const mockData = [
      {
        user_id: '123',
        best_score: 100,
        games_won: 5,
        win_loss_ratio: 0.8,
        profiles: null,
      },
    ];

    const mockSelect = vi.fn().mockResolvedValue({ data: mockData, error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as any);

    const result = await getLeaderboard();

    expect(result[0].username).toBeUndefined();
  });
});