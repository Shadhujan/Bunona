import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 w-full h-12 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent to-white/90"
        style={{
          animation: 'morphing 8s ease-in-out infinite',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.9) 100%)'
        }}
      />
      <div className="relative h-full flex items-center justify-center">
        <p className="text-[#4A2C00] font-medium">
          © 2025 Shadhujan J || UOB 2433192
        </p>
      </div>
    </footer>
  );
};

export default Footer;
