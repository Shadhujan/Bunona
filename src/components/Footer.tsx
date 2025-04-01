import React from 'react';
import { FaLinkedin, FaGithub, FaInstagram } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 w-full h-16 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent to-white/90"
        style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.9) 100%)' }}
      >
        <div className="relative h-full flex flex-col items-center justify-center text-[#4A2C00] font-medium">
          <p>© 2025 Shadhujan J || UOB 2433192</p>
          <div className="flex space-x-4 mt-2 pointer-events-auto">
            <a href="https://github.com/Shadhujan" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <FaGithub className="text-[#4A2C00] hover:text-gray-800" size={20} />
            </a>
            <a href="https://www.instagram.com/jeya.shad38" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram className="text-[#4A2C00] hover:text-pink-400" size={20} />
            </a>
            <a href="https://www.linkedin.com/in/shadhujan" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedin className="text-[#4A2C00] hover:text-blue-700" size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
