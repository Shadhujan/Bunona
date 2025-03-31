import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Zap, Swords, HelpCircle } from "lucide-react";
import DecorativeBanana from "../components/DecorativeBanana";

const difficultyOptions = {
  easy: {
    title: "Easy",
    description:
      "Perfect for beginners! Solve simple number puzzles with generous time limits.",
    icon: Brain,
    color: "bg-emerald-500 hover:bg-emerald-600",
    borderColor: "border-emerald-400",
    shadowColor: "shadow-emerald-500/50",
    timeLimit: 60,
  },
  medium: {
    title: "Medium",
    description:
      "Challenge yourself with more complex patterns and moderate time pressure.",
    icon: Zap,
    color: "bg-amber-500 hover:bg-amber-600",
    borderColor: "border-amber-400",
    shadowColor: "shadow-amber-500/50",
    timeLimit: 45,
  },
  hard: {
    title: "Hard",
    description:
      "For puzzle masters! Complex challenges with strict time limits.",
    icon: Swords,
    color: "bg-red-500 hover:bg-red-600",
    borderColor: "border-red-400",
    shadowColor: "shadow-red-500/50",
    timeLimit: 30,
  },
};

type Difficulty = "easy" | "medium" | "hard" | null;

export function DifficultyPage() {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>(null);
  const [isLoading] = useState(false);

  const handleStartGame = () => {
    if (!selectedDifficulty) return;
    navigate(`/game/${selectedDifficulty}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center p-4">
      <div className="bg-white/90 rounded-lg border-2 border-yellow-500 p-8 w-full max-w-4xl">
        <div className="text-center mb-8">
          <button
            onClick={() => navigate("/help")}
            className="absolute w-12 h-12 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all hover:scale-105"
            aria-label="Help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <h2 className="text-4xl font-bold text-[#4A2C00] mb-2">
            Select Difficulty
          </h2>
          <p className="text-gray-600">Choose your challenge level</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {(
            Object.entries(difficultyOptions) as [
              Difficulty,
              typeof difficultyOptions.easy
            ][]
          ).map(([key, option]) => {
            const Icon = option.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedDifficulty(key)}
                className={`${
                  selectedDifficulty === key
                    ? `${option.color} scale-105 shadow-lg ${option.shadowColor}`
                    : "bg-gray-100 hover:bg-gray-200"
                } p-6 rounded-lg border-2 ${
                  selectedDifficulty === key
                    ? option.borderColor
                    : "border-transparent"
                } transition-all duration-300 flex flex-col items-center text-center group relative`}
                aria-label={`Select ${option.title} difficulty`}
              >
                <Icon
                  className={`w-12 h-12 mb-4 ${
                    selectedDifficulty === key ? "text-white" : "text-gray-700"
                  } transition-colors duration-300`}
                />
                <h3
                  className={`text-xl font-bold mb-2 ${
                    selectedDifficulty === key ? "text-white" : "text-gray-800"
                  } transition-colors duration-300`}
                >
                  {option.title}
                </h3>
                <p
                  className={`text-sm ${
                    selectedDifficulty === key ? "text-white" : "text-gray-600"
                  } transition-colors duration-300`}
                >
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded transition-all hover:scale-105"
          >
            Back to Menu
          </button>

          <button
            onClick={handleStartGame}
            disabled={!selectedDifficulty || isLoading}
            className={`px-6 py-3 rounded transition-all ${
              selectedDifficulty && !isLoading
                ? "bg-red-500 hover:bg-red-600 hover:scale-105 text-white"
                : "bg-gray-300 cursor-not-allowed text-gray-500"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Loading...</span>
              </div>
            ) : (
              "Start Game"
            )}
          </button>
        </div>
      </div>

      <DecorativeBanana />
    </div>
  );
}
