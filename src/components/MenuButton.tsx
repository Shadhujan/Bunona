// src/components/MenuButton.tsx
import { LucideIcon } from "lucide-react";
import { useState } from "react";

interface MenuButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tooltipText?: string;
}

export function MenuButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  tooltipText,
}: MenuButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full ${
          disabled
            ? "bg-red-500/50 cursor-not-allowed"
            : "bg-red-500 hover:bg-red-600"
        } text-white py-3 px-6 rounded transition-all hover:scale-105 flex items-center justify-center space-x-2`}
      >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </button>

      {tooltipText && disabled && showTooltip && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50 whitespace-nowrap">
          <div className="relative">
            {tooltipText}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      )}
    </div>
  );
}
