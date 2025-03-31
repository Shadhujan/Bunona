import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Heart, Timer, Trophy, XCircle, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import DecorativeBanana from "../components/DecorativeBanana";

interface GamePageProps {
  difficulty?: "easy" | "medium" | "hard";
}

interface Question {
  question: string;
  solution: number;
}

const POINTS_MAP = {
  easy: 10,
  medium: 20,
  hard: 30,
};

const TIME_LIMITS = {
  easy: 60,
  medium: 45,
  hard: 30,
};

export function GamePage({ difficulty: propDifficulty }: GamePageProps) {
  const { difficulty: paramDifficulty } = useParams<{
    difficulty: "easy" | "medium" | "hard";
  }>();
  const difficulty = propDifficulty || paramDifficulty || "easy";
  const navigate = useNavigate();
  const { user } = useAuth();
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMITS[difficulty]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userAnswer, setUserAnswer] = useState("");
  const [gameState, setGameState] = useState<
    "playing" | "correct" | "incorrect" | "gameover"
  >("playing");
  const [error, setError] = useState<string | null>(null);
  const [isSavingScore, setIsSavingScore] = useState(false);

  const fetchQuestion = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("https://marcconrad.com/uob/banana/api.php");
      if (!response.ok) throw new Error("Failed to fetch question");

      const data = await response.json();
      if (!data.question || typeof data.solution !== "number") {
        throw new Error("Invalid question format");
      }

      setCurrentQuestion(data);
      setGameState("playing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load question");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  //timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState("gameover");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    if (timeLeft === 0 || gameState === "gameover") {
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion || gameState !== "playing") return;

    const answer = parseInt(userAnswer, 10);
    if (isNaN(answer)) {
      setError("Please enter a valid number");
      return;
    }

    if (answer === currentQuestion.solution) {
      setScore((prev) => prev + POINTS_MAP[difficulty]);
      setGameState("correct");
      setTimeout(() => {
        fetchQuestion();
        setUserAnswer("");
        setGameState("playing");
      }, 1500);
    } else {
      setLives((prev) => prev - 1);
      setGameState("incorrect");
      if (lives <= 1) {
        setGameState("gameover");
      } else {
        setTimeout(() => {
          setGameState("playing");
          setUserAnswer("");
        }, 1500);
      }
    }
  };

  const saveScore = async () => {
    if (!user?.id || isSavingScore) return;

    setIsSavingScore(true);
    try {
      const { error: insertError } = await supabase.from("game_scores").insert([
        {
          user_id: user.id,
          score,
          difficulty,
          completed_at: new Date().toISOString(),
        },
      ]);

      if (insertError) throw insertError;
    } catch (err) {
      console.error("Failed to save score:", err);
      setError("Failed to save your score. Please try again.");
    } finally {
      setIsSavingScore(false);
    }
  };

  useEffect(() => {
    if (gameState === "gameover") {
      saveScore();
    }
  }, [gameState]);

  if (gameState === "gameover") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center p-4">
        <div className="bg-white/90 rounded-lg border-2 border-yellow-500 p-8 w-full max-w-md text-center">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-[#4A2C00] mb-4">Game Over!</h2>
          <p className="text-xl mb-2">Final Score: {score}</p>
          {currentQuestion && (
            <p className="text-gray-600 mb-6">
              The last answer was: {currentQuestion.solution}
            </p>
          )}
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="space-y-4">
            <button
              onClick={() => navigate("/difficulty")}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded transition-all hover:scale-105"
            >
              Play Again
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition-all hover:scale-105"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center p-4">
      <div className="bg-white/90 rounded-lg border-2 border-yellow-500 p-8 w-full max-w-4xl">
        {/* Game Stats */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div
              className="flex space-x-1"
              aria-label={`Lives remaining: ${lives}`}
            >
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={`w-6 h-6 ${
                    i < lives ? "text-red-500 fill-current" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <div
              className="text-lg font-semibold"
              aria-label={`Current score: ${score}`}
            >
              Score: {score}
            </div>
          </div>
          <div
            className="flex items-center space-x-2"
            aria-label={`Time remaining: ${timeLeft} seconds`}
          >
            <Timer
              className={`w-6 h-6 ${
                timeLeft <= 10 ? "text-red-500" : "text-gray-600"
              }`}
            />
            <span
              className={`font-mono text-xl ${
                timeLeft <= 10 ? "text-red-500" : "text-gray-600"
              }`}
            >
              {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading question...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchQuestion}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded transition-all hover:scale-105"
            >
              Try Again
            </button>
          </div>
        ) : (
          currentQuestion && (
            <div
              className={`space-y-6 ${
                gameState === "incorrect" ? "animate-shake" : ""
              }`}
            >
              <div className="relative">
                <img
                  src={currentQuestion.question}
                  alt="Banana Math Question"
                  className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                />
                {gameState === "correct" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-lg">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                  </div>
                )}
                {gameState === "incorrect" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-lg">
                    <XCircle className="w-16 h-16 text-red-500" />
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="answer"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Answer
                  </label>
                  <input
                    type="number"
                    id="answer"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter your answer between 0-9"
                    min="0"
                    max="9"
                    required
                    disabled={gameState !== "playing"}
                    aria-label="Enter your answer"
                    autoFocus
                    ref={(input) => input && input.focus()}
                  />
                </div>
                <button
                  type="submit"
                  disabled={gameState !== "playing"}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answer
                </button>
              </form>
            </div>
          )
        )}
      </div>

      <DecorativeBanana />
    </div>
  );
}
