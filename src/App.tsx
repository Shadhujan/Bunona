import React, { useEffect, useState, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DifficultyPage } from './pages/DifficultyPage';
import { GamePage } from './pages/GamePage';
import { DailyChallengeGame } from './pages/DailyChallengeGame';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { HelpPage } from './pages/HelpPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Banana, Trophy, User, LogOut, PlayCircle, Calendar, HelpCircle, XCircle } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { getDailyChallengeStatus } from './lib/database';
import Footer from './pages/Footer';
import Header from './pages/Header';

function MainMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const username = user?.user_metadata.username || 'Player';
  const [dailyChallenge, setDailyChallenge] = useState({
    isAvailable: false,
    nextAvailableAt: null as string | null,
    timeRemaining: '' as string | null,
    showTooltip: false
  });
  const [showModal, setShowModal] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleStartGame = () => {
    navigate('/difficulty');
  };

  const handleDailyChallenge = () => {
    if (dailyChallenge.isAvailable) {
      navigate('/daily-challenge');
    } else {
      setShowModal(true);
    }
  };

  useEffect(() => {
    const checkDailyChallenge = async () => {
      if (user) {
        const status = await getDailyChallengeStatus(user.id);
        setDailyChallenge(prev => ({
          ...prev,
          isAvailable: status.isAvailable,
          nextAvailableAt: status.nextAvailableAt,
          timeRemaining: null
        }));
      }
    };

    checkDailyChallenge();
    const interval = setInterval(checkDailyChallenge, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (dailyChallenge.nextAvailableAt) {
      const updateTimeRemaining = () => {
        const now = new Date();
        const next = new Date(dailyChallenge.nextAvailableAt!);
        const diff = next.getTime() - now.getTime();
        
        if (diff <= 0) {
          setDailyChallenge(prev => ({ 
            ...prev, 
            isAvailable: true, 
            timeRemaining: null 
          }));
          return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setDailyChallenge(prev => ({
          ...prev,
          timeRemaining: `${hours}h ${minutes}m ${seconds}s`
        }));
      };

      updateTimeRemaining();
      const interval = setInterval(updateTimeRemaining, 1000); // Update every second
      return () => clearInterval(interval);
    }
  }, [dailyChallenge.nextAvailableAt]);

  // Generate random positions for floating bananas
const generateRandomPosition = () => ({
  top: `${Math.random() * 100 + 10}%`,
  left: `${Math.random() * 100 + 10}%`
});

// Create an array of floating bananas with random positions and delays, memoized so it doesn't recalculate on every render
const floatingBananas = useMemo(
  () =>
    Array.from({ length: 8 }).map((_, index) => ({
      id: index,
      style: {
        ...generateRandomPosition(),
        animationDelay: `${index * 0.5}s`,
        animationDuration: `${6 + Math.random() * 4}s`
      }
    })),
  []
);


  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 to-yellow-400">
      
      {/* Header */}
      <Header username={username} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white/90 rounded-lg border-2 border-yellow-500 p-8 w-full max-w-md relative overflow-hidden">
          {/* Floating Bananas */}
          {floatingBananas.map((banana) => (
            <Banana
              key={banana.id}
              className="absolute w-8 h-8 text-yellow-500 animate-float opacity-45"
              style={banana.style}
            />
          ))}
          
          {/* Title with Spring Animation */}
          <h1 className="text-6xl font-bold text-[#4A2C00] text-center mb-8 animate-spring relative z-10">
            Bunona
          </h1>
          
          <div className="space-y-4 relative z-10">
            <button 
              onClick={handleStartGame}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded transition-all hover:scale-105 flex items-center justify-center space-x-2"
              id="start-game-button"
              data-testid="start-game-button"
            >
              <PlayCircle className="w-5 h-5" />
              <span>Start Game</span>
            </button>
            
            <div 
              className="relative"
              onMouseEnter={() => setDailyChallenge(prev => ({ ...prev, showTooltip: true }))}
              onMouseLeave={() => setDailyChallenge(prev => ({ ...prev, showTooltip: false }))}
            >
              <button 
                onClick={handleDailyChallenge}
                className={`w-full ${
                  dailyChallenge.isAvailable
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-red-500/50 text-white py-3 px-6 rounded cursor-not-allowed'
                } text-white py-3 px-6 rounded transition-all hover:scale-105 flex items-center justify-center space-x-2`}
              >
                <Calendar className="w-5 h-5" />
                <span>Daily Challenge</span>
              </button>
              
              {!dailyChallenge.isAvailable && dailyChallenge.timeRemaining && dailyChallenge.showTooltip && (
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50 whitespace-nowrap">
                  <div className="relative">
                    Available in {dailyChallenge.timeRemaining}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => navigate('/leaderboard')}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded transition-all hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Trophy className="w-5 h-5" />
              <span>Leaderboard</span>
            </button>
            
            <button 
              onClick={() => navigate('/profile')}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded transition-all hover:scale-105 flex items-center justify-center space-x-2"
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </button>

            <button 
              onClick={() => navigate('/help')}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded transition-all hover:scale-105 flex items-center justify-center space-x-2"
            >
              <HelpCircle className="w-5 h-5" />
              <span>Help</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded transition-all hover:scale-105 flex items-center justify-center space-x-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <div className="text-center">
              <Calendar className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#4A2C00] mb-4">Challenge Not Available</h2>
              <p className="text-gray-600 mb-6">
                This challenge will be available in:
                <br />
                <span className="text-xl font-semibold text-yellow-600">
                  {dailyChallenge.timeRemaining}
                </span>
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded transition-all hover:scale-105"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decorative Bananas */}
      <div className="fixed bottom-0 left-0 w-24 h-24 transform -rotate-12 pointer-events-none">
        <Banana className="w-full h-full text-yellow-600 opacity-20" />
      </div>
      <div className="fixed top-10 right-0 w-24 h-24 transform rotate-45 pointer-events-none">
        <Banana className="w-full h-full text-yellow-600 opacity-20" />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/difficulty" element={
        <ProtectedRoute>
            <DifficultyPage />
          <Footer />
        </ProtectedRoute>
      } />
      <Route path="/game/:difficulty" element={
        <ProtectedRoute>
            <GamePage />
          <Footer />
        </ProtectedRoute>
      } />
      <Route path="/daily-challenge" element={
        <ProtectedRoute>
          <DailyChallengeGame />
        </ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute>
          <LeaderboardPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/help" element={
        <ProtectedRoute>
          <HelpPage />
        </ProtectedRoute>
      } />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainMenu />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

