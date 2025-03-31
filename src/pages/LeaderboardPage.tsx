import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, Crown, Banana, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getLeaderboard } from '../lib/database';
import DecorativeBanana from '../components/DecorativeBanana';

interface LeaderboardEntry {
  userId: string;
  username: string;
  bestScore: number;
  gamesWon: number;
  winLossRatio: number;
}

const RankIcon = ({ rank }: { rank: number }) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-500" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />;
    case 3:
      return <Medal className="w-6 h-6 text-amber-700" />;
    default:
      return <span className="font-mono text-gray-600">#{rank}</span>;
  }
};

export function LeaderboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await getLeaderboard(10);
        setLeaderboard(data);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 to-yellow-400 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-[#4A2C00] hover:text-yellow-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Menu</span>
          </button>
        </div>

        {/* Title Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Trophy className="w-16 h-16 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold text-[#4A2C00] mb-2">Top Banana Players</h1>
          <p className="text-yellow-800">Who will be crowned the ultimate banana master?</p>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white/90 rounded-lg border-2 border-yellow-500 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-yellow-500 text-white">
                  <th className="px-6 py-4 text-left">Rank</th>
                  <th className="px-6 py-4 text-left">Player</th>
                  <th className="px-6 py-4 text-right">Best Score</th>
                  <th className="px-6 py-4 text-right">Games Won</th>
                  <th className="px-6 py-4 text-right">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((player, index) => (
                  <tr
                    key={player.userId}
                    className={`
                      ${index % 2 === 0 ? 'bg-yellow-50' : 'bg-white'}
                      ${player.userId === user?.id ? 'bg-yellow-100' : ''}
                      hover:bg-yellow-100 transition-colors
                      ${index < 3 ? 'font-semibold' : ''}
                    `}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <RankIcon rank={index + 1} />
                      </div>
                    </td>
                    <td className="px-6 py-4 flex items-center space-x-2">
                      <Banana className={`w-5 h-5 ${index < 3 ? 'text-yellow-500' : 'text-gray-400'}`} />
                      <span>{player.username}</span>
                    </td>
                    <td className="px-6 py-4 text-right">{player.bestScore.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">{player.gamesWon}</td>
                    <td className="px-6 py-4 text-right">
                      {((player.winLossRatio || 0) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-8 bg-white/90 rounded-lg border-2 border-yellow-500 mt-4">
            <p className="text-gray-600">No leaderboard data available yet.</p>
          </div>
        )}
      </div>

      <DecorativeBanana />
    </div>
  );
}