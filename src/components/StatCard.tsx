import React from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  alt?: string; // Optional alt property
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
}) => (
  <div className="bg-white/90 rounded-lg p-4 border-2 border-yellow-500 shadow-md hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <p className="text-2xl font-bold text-[#4A2C00]">{value}</p>
  </div>
);

export default StatCard;
