import React from "react";

interface BadgeProps {
  description: string; // or number if you prefer
}

const BadgeProps: React.FC<BadgeProps> = ({ description }) => {
  return (
    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50 whitespace-nowrap">
      <div className="relative">
        {description}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-800"></div>
      </div>
    </div>
  );
};

export default BadgeProps;
