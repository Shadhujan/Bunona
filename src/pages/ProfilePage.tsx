import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Banana,
  Trophy,
  Target,
  ArrowLeft,
  Gamepad2,
  Percent,
  Flame,
  Crown,
  Star,
  HeartCrack,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getDailyChallengeStatus, getUserStats } from "../lib/database";
import type { UserStats, DailyChallenge } from "../lib/database";
import BadgeProps from "../components/BadgeProps";
import DecorativeBanana from "../components/DecorativeBanana";
import StatCard from "../components/StatCard";

export function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const username = user?.user_metadata.username || "Player";
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Add the daily challenge status state:
  const [dailyChallengeStatus, setDailyChallengeStatus] =
    useState<DailyChallenge | null>(null);

  useEffect(() => {
    const loadUserStats = async () => {
      if (user) {
        try {
          const userStats = await getUserStats(user.id);
          setStats(userStats);
        } catch (error) {
          console.error("Error loading user stats:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadUserStats();
  }, [user]);

  // Fetch daily challenge status (e.g., for the streak)
  useEffect(() => {
    if (user) {
      getDailyChallengeStatus(user.id)
        .then((status) => setDailyChallengeStatus(status))
        .catch((err) =>
          console.error("Error fetching daily challenge status", err)
        );
    }
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
            onClick={() => navigate("/")}
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
            Title :
            {stats?.winLossRatio && stats.winLossRatio > 0.7
              ? "Banana Master"
              : stats?.winLossRatio && stats.winLossRatio > 0.5
              ? "Banana Expert"
              : "Banana Apprentice"}
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
            icon={HeartCrack}
            color="text-red-500"
          />
          <StatCard
            title="Win Rate"
            value={`${((stats?.winLossRatio || 0) * 100).toFixed(1)}%`}
            icon={Percent}
            color="text-purple-500"
          />
          <StatCard
            title="Streak"
            value={dailyChallengeStatus?.currentStreak || 0}
            icon={Flame}
            color="text-orange-500"
          />
        </div>

        {/* Last Played */}
        {stats?.lastPlayedAt && (
          <div className="bg-white/90 rounded-lg border-2 border-yellow-500 p-6 mb-8">
            <h2 className="text-2xl font-bold text-[#4A2C00] mb-4">
              Last Played
            </h2>
            <p className="text-gray-600">
              {new Date(stats.lastPlayedAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}

        {/* Achievements Section */}
        <div className="bg-white/90 rounded-lg border-2 border-yellow-500 p-6">
          <h2 className="text-2xl font-bold text-[#4A2C00] mb-4">
            Achievements
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Dynamic achievements based on stats */}
            {stats && (
              <>
                {stats.gamesWon > 0 && (
                  <div className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:border-yellow-300 transition-colors group">
                    <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
                    <span className="text-sm text-center text-[#4A2C00]">
                      First Win
                    </span>
                    <div className="hidden group-hover:block absolute bg-white text-gray-700 text-xs rounded-lg shadow-lg p-2 mt-2">
                      <BadgeProps description="First win of the game" />
                    </div>
                  </div>
                )}
                {stats.bestScore >= 500 && (
                  <div className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:border-yellow-300 transition-colors group">
                    <Crown className="w-8 h-8 text-yellow-500 mb-2" />
                    <span className="text-sm text-center text-[#4A2C00]">
                      Score Master
                    </span>
                    <div className="hidden group-hover:block absolute bg-white text-gray-700 text-xs rounded-lg shadow-lg p-2 mt-2">
                      <BadgeProps description="Get score morethan 500 in one game" />
                    </div>
                  </div>
                )}
                {stats.winLossRatio >= 0.7 && (
                  <div className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:border-yellow-300 transition-colors group">
                    <Star className="w-8 h-8 text-yellow-500 mb-2" />
                    <span className="text-sm text-center text-[#4A2C00]">
                      Elite Player
                    </span>
                    <div className="hidden group-hover:block absolute bg-white text-gray-700 text-xs rounded-lg shadow-lg p-2 mt-2">
                      <BadgeProps description="Get Win Ratio above 70%" />
                    </div>
                  </div>
                )}
                {stats.totalGames >= 50 && (
                  <div className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:border-yellow-300 transition-colors group">
                    <Gamepad2 className="w-8 h-8 text-yellow-500 mb-2" />
                    <span className="text-sm text-center text-[#4A2C00]">
                      Dedicated Player
                    </span>
                    <div className="hidden group-hover:block absolute bg-white text-gray-700 text-xs rounded-lg shadow-lg p-2 mt-2">
                      <BadgeProps description="Played more than 50 games total" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <DecorativeBanana />
    </div>
  );
}
