import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Banana,
  Trophy,
  Target,
  ArrowLeft,
  Gamepad2,
  Percent,
  Flame,
  Crown,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserStats } from '../lib/database';
import type { UserStats } from '../lib/database';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}

const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => (
  <div className="bg-white/90 rounded-lg p-4 border-2 border-yellow-500 shadow-md hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <p className="text-2xl font-bold text-[#4A2C00]">{value}</p>
  </div>
);

export function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const username = user?.user_metadata.username || 'Player';
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserStats = async () => {
      if (user) {
        try {
          const userStats = await getUserStats(user.id);
          setStats(userStats);
        } catch (error) {
          console.error('Error loading user stats:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadUserStats();
  }, [user]);

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

        {/* Profile Header */}
        <div className="bg-white/90 rounded-lg border-2 border-yellow-500 p-6 mb-8 text-center">
          <div className="w-24 h-24 mx-auto bg-yellow-500 rounded-full flex items-center justify-center mb-4">
            <Banana className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#4A2C00] mb-2">{username}</h1>
          <p className="text-yellow-800">
            {stats?.winLossRatio && stats.winLossRatio > 0.7
              ? 'Banana Master'
              : stats?.winLossRatio && stats.winLossRatio > 0.5
              ? 'Banana Expert'
              : 'Banana Apprentice'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Current Score"
            value={stats?.currentScore || 0}
            icon={Trophy}
            color="text-yellow-500"
          />
          <StatCard
            title="Best Score"
            value={stats?.bestScore || 0}
            icon={Crown}
            color="text-yellow-600"
          />
          <StatCard
            title="Total Games"
            value={stats?.totalGames || 0}
            icon={Gamepad2}
            color="text-blue-500"
          />
          <StatCard
            title="Games Won"
            value={stats?.gamesWon || 0}
            icon={Target}
            color="text-green-500"
          />
          <StatCard
            title="Games Lost"
            value={stats?.gamesLost || 0}
            icon={Flame}
            color="text-red-500"
          />
          <StatCard
            title="Win Rate"
            value={`${((stats?.winLossRatio || 0) * 100).toFixed(1)}%`}
            icon={Percent}
            color="text-purple-500"
          />
        </div>

        {/* Last Played */}
        {stats?.lastPlayedAt && (
          <div className="bg-white/90 rounded-lg border-2 border-yellow-500 p-6 mb-8">
            <h2 className="text-2xl font-bold text-[#4A2C00] mb-4">Last Played</h2>
            <p className="text-gray-600">
              {new Date(stats.lastPlayedAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        )}

        {/* Achievements Section */}
        <div className="bg-white/90 rounded-lg border-2 border-yellow-500 p-6">
          <h2 className="text-2xl font-bold text-[#4A2C00] mb-4">Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Dynamic achievements based on stats */}
            {stats && (
              <>
                {stats.gamesWon > 0 && (
                  <div className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:border-yellow-300 transition-colors">
                    <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
                    <span className="text-sm text-center text-[#4A2C00]">First Win</span>
                  </div>
                )}
                {stats.bestScore >= 500 && (
                  <div className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:border-yellow-300 transition-colors">
                    <Crown className="w-8 h-8 text-yellow-500 mb-2" />
                    <span className="text-sm text-center text-[#4A2C00]">Score Master</span>
                  </div>
                )}
                {stats.winLossRatio >= 0.7 && (
                  <div className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:border-yellow-300 transition-colors">
                    <Star className="w-8 h-8 text-yellow-500 mb-2" />
                    <span className="text-sm text-center text-[#4A2C00]">Elite Player</span>
                  </div>
                )}
                {stats.totalGames >= 50 && (
                  <div className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:border-yellow-300 transition-colors">
                    <Gamepad2 className="w-8 h-8 text-yellow-500 mb-2" />
                    <span className="text-sm text-center text-[#4A2C00]">Dedicated Player</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Decorative Bananas */}
      <div className="fixed bottom-0 left-0 w-24 h-24 transform -rotate-12">
        <Banana className="w-full h-full text-yellow-600 opacity-20" />
      </div>
      <div className="fixed top-0 right-0 w-24 h-24 transform rotate-45">
        <Banana className="w-full h-full text-yellow-600 opacity-20" />
      </div>
    </div>
  );
}