// src/pages/MainMenu.tsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banana, PlayCircle, Calendar, Trophy, User, HelpCircle, LogOut, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getDailyChallengeStatus } from '../lib/database';
import Footer from './Footer';
import Header from './Header';
import { MenuButton } from '../components/MenuButton';

export function MainMenu() {
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
    const interval = setInterval(checkDailyChallenge, 60000);
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
      const interval = setInterval(updateTimeRemaining, 1000);
      return () => clearInterval(interval);
    }
  }, [dailyChallenge.nextAvailableAt]);

  const floatingBananas = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, index) => ({
        id: index,
        style: {
          top: `${Math.random() * 100 + 10}%`,
          left: `${Math.random() * 100 + 10}%`,
          animationDelay: `${index * 0.5}s`,
          animationDuration: `${6 + Math.random() * 4}s`
        }
      })),
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 to-yellow-400">
      <Header username={username} />
      
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white/90 rounded-lg border-2 border-yellow-500 p-8 w-full max-w-md relative overflow-hidden">
          {floatingBananas.map((banana) => (
            <Banana
              key={banana.id}
              className="absolute w-8 h-8 text-yellow-500 animate-float opacity-45"
              style={banana.style}
            />
          ))}
          
          <h1 className="text-6xl font-bold text-[#4A2C00] text-center mb-8 animate-spring relative z-10">
            Bunona
          </h1>
          
          <div className="space-y-4 relative z-10">
            <MenuButton
              icon={PlayCircle}
              label="Start Game"
              onClick={handleStartGame}
            />
            
            <MenuButton
              icon={Calendar}
              label="Daily Challenge"
              onClick={handleDailyChallenge}
              disabled={!dailyChallenge.isAvailable}
              tooltipText={dailyChallenge.timeRemaining || ''}
            />

            <MenuButton
              icon={Trophy}
              label="Leaderboard"
              onClick={() => navigate('/leaderboard')}
            />

            <MenuButton
              icon={User}
              label="Profile"
              onClick={() => navigate('/profile')}
            />

            <MenuButton
              icon={HelpCircle}
              label="Help"
              onClick={() => navigate('/help')}
            />

            <MenuButton
              icon={LogOut}
              label="Logout"
              onClick={handleLogout}
            />
          </div>
        </div>
      </div>

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

      <div className="fixed bottom-0 left-0 w-24 h-24 transform -rotate-12 pointer-events-none">
        <Banana className="w-full h-full text-yellow-600 opacity-20" />
      </div>
      <div className="fixed top-10 right-0 w-24 h-24 transform rotate-45 pointer-events-none">
        <Banana className="w-full h-full text-yellow-600 opacity-20" />
      </div>

      <Footer />
    </div>
  );
}