import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Timer,
  Trophy,
  XCircle,
  CheckCircle,
  ArrowLeft,
  Star,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { getDailyChallengeStatus } from "../lib/database";

interface Question {
  question: string;
  solution: number;
}

export function DailyChallengeGame() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [score, setScore] = useState(10);
  const [timeLeft, setTimeLeft] = useState(30); // Increased time for daily challenge
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userAnswer, setUserAnswer] = useState("");
  const [gameState, setGameState] = useState<
    "playing" | "correct" | "incorrect" | "gameover"
  >("playing");
  const [error, setError] = useState<string | null>(null);
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [streak, setStreak] = useState(1);

  useEffect(() => {
    const loadStreak = async () => {
      if (user) {
        const status = await getDailyChallengeStatus(user.id); // Fetch user's streak status
        setStreak(status.currentStreak); // Set user's streak
      }
    };
    loadStreak();
  }, [user]);

  const fetchQuestion = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("https://marcconrad.com/uob/banana/api.php"); // Fetch new question
      if (!response.ok) throw new Error("Failed to fetch question");

      const data = await response.json();
      if (!data.question || typeof data.solution !== "number") {
        throw new Error("Invalid question format");
      }

      setCurrentQuestion(data); // Set current question
      setGameState("playing"); // Set game state to playing
      setTimeLeft(10); // Reset timer for new question
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load question"); // Set error message
    } finally {
      setIsLoading(false); // Set loading status to false
    }
  }, []);

  useEffect(() => {
    fetchQuestion(); // Fetch question on component mount
  }, [fetchQuestion]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState("gameover"); // Set game state to gameover if time runs out
          return 0;
        }
        return prev - 1; // Decrease timer
      });
    }, 1000);

    if (timeLeft === 0 || gameState === "gameover") {
      clearInterval(timer); // Clear timer if game is over
    }

    return () => clearInterval(timer); // Cleanup timer on component unmount
  }, [timeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion || gameState !== "playing") return;

    const answer = parseInt(userAnswer, 10);
    if (isNaN(answer)) {
      setError("Please enter a valid number"); // Set error if answer is not a number
      return;
    }

    if (answer === currentQuestion.solution) {
      setScore((prev) => prev * 2); // Double the score for correct answers
      setGameState("correct"); // Set game state to correct
      setTimeout(() => {
        fetchQuestion(); // Fetch new question after delay
        setUserAnswer(""); // Reset user answer
        setGameState("playing"); // Set game state to playing
      }, 1500);
    } else {
      setGameState("gameover"); // Set game state to gameover if answer is incorrect
    }
  };

  const saveScore = async () => {
    if (!user?.id || isSavingScore) return;

    setIsSavingScore(true);
    try {
      // Use Sri Lanka timezone for the challenge date
      const sriLankaTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Colombo",
      });
      const today = new Date(sriLankaTime).toISOString().split("T")[0];

      const { error: insertError } = await supabase
        .from("daily_challenge_scores")
        .insert([
          {
            user_id: user.id,
            score,
            completed_at: new Date().toISOString(),
            challenge_date: today,
          },
        ]);

      if (insertError) throw insertError;
    } catch (err) {
      console.error("Failed to save score:", err);
      setError("Failed to save your score. Please try again."); // Set error if saving score fails
    } finally {
      setIsSavingScore(false); // Set saving score status to false
    }
  };

  useEffect(() => {
    if (gameState === "gameover") {
      saveScore(); // Save score when game is over
    }
  }, [gameState]);

  if (gameState === "gameover") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center p-4">
        <div className="bg-white/90 rounded-lg border-2 border-yellow-500 p-8 w-full max-w-md text-center">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-[#4A2C00] mb-4">
            Daily Challenge Complete!
          </h2>
          <div className="mb-6">
            <p className="text-xl mb-2">Final Score: {score}</p>
            <div className="flex items-center justify-center space-x-2 text-yellow-600">
              <Star className="w-5 h-5" />
              <span>Current Streak: {streak}</span>
            </div>
          </div>
          {currentQuestion && (
            <p className="text-gray-600 mb-6">
              The last answer was: {currentQuestion.solution}
            </p>
          )}
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="space-y-4">
            <button
              onClick={() => navigate("/")}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded transition-all hover:scale-105"
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
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 text-[#4A2C00] hover:text-yellow-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Exit Challenge</span>
          </button>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-semibold">Streak: {streak}</span>
            </div>
            <div className="text-lg font-semibold">Score: {score}</div>
            <div className="flex items-center space-x-2">
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
                {timeLeft}s
              </span>
            </div>
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
                  alt="Daily Challenge Question"
                  className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                />
                {gameState === "correct" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-lg">
                    <CheckCircle className="w-16 h-16 text-green-500" />
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
                    placeholder="Enter your answer"
                    min="0"
                    max="9"
                    required
                    disabled={gameState !== "playing"}
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
    </div>
  );
}
