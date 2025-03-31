// In Header.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Banana } from 'lucide-react';
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  username: string;
}

const Header: React.FC<HeaderProps> = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const username = user?.user_metadata.username || "Player";
  return (
    <div className="bg-gradient-to-br from-yellow-200 to-yellow-400">
    <nav
      className="bg-yellow-200/90 shadow-md px-4 py-2 flex items-center justify-between rounded-lg backdrop-filter backdrop-blur-lg"
      style={{
        animation: 'morphing 8s ease-in-out infinite',
        background: 'linear-gradient(to top, transparent 0%, rgba(255, 255, 255, 0.9) 100%)'
      }}
    >
      <div
        className="cursor-pointer transform hover:scale-110 transition-transform duration-300"
        onClick={() => navigate('/')}
      >
        <Banana className="w-8 h-8 text-yellow-500 m-2.5" />
      </div>
      <div
        className="cursor-pointer border-2 shadow-md border-yellow-500 px-8 py-3 rounded-md hover:bg-yellow-50 transition-colors duration-300 bg-yellow-200"
        onClick={() => navigate('/profile')}
      >
        <span className="text-[#4A2C00] font-bold text-lg uppercase">{username}</span>
      </div>
    </nav>
    </div>
  );
};

export default Header;
