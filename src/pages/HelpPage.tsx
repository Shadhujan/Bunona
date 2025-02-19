import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Banana, Brain, Target, Clock, Trophy, HelpCircle } from 'lucide-react';

export function HelpPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 to-yellow-400 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-[#4A2C00] hover:text-yellow-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <HelpCircle className="w-16 h-16 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold text-[#4A2C00] mb-2">How to Play</h1>
          <p className="text-yellow-800">Master the game with these helpful tips!</p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Game Basics */}
          <div className="bg-white/90 rounded-lg border-2 border-yellow-500 p-6">
            <h2 className="text-2xl font-bold text-[#4A2C00] mb-4 flex items-center">
              <Brain className="w-6 h-6 mr-2 text-yellow-500" />
              Game Basics
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                Bunona is a pattern recognition game where you need to identify the missing number in a sequence of bananas.
                Each puzzle presents a unique challenge that tests your logical thinking and problem-solving skills.
              </p>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-[#4A2C00] mb-2">Example:</h3>
                <img 
                  src="https://www.sanfoh.com/uob/banana/data/t9e20c893e055dcedb1688dd580n1.png" 
                  alt="Example Banana Puzzle"
                  className="rounded-lg shadow-md mb-2"
                />
                <p className="text-sm text-gray-600">
                  In this example, you need to find the pattern and determine which number (0-9) completes the sequence.
                </p>
              </div>
            </div>
          </div>

          {/* How to Play */}
          <div className="bg-white/90 rounded-lg border-2 border-yellow-500 p-6">
            <h2 className="text-2xl font-bold text-[#4A2C00] mb-4 flex items-center">
              <Target className="w-6 h-6 mr-2 text-yellow-500" />
              How to Play
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>Choose your difficulty level (Easy, Medium, or Hard)</li>
              <li>Observe the pattern in the banana sequence carefully</li>
              <li>Look for mathematical relationships or visual patterns</li>
              <li>Enter a number from 0 to 9 that completes the sequence</li>
              <li>Submit your answer and see if you're correct!</li>
            </ol>
          </div>

          {/* Scoring System */}
          <div className="bg-white/90 rounded-lg border-2 border-yellow-500 p-6">
            <h2 className="text-2xl font-bold text-[#4A2C00] mb-4 flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
              Scoring System
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>Points are awarded based on difficulty:</p>
              <ul className="list-disc list-inside pl-4 space-y-2">
                <li>Easy: 10 points per correct answer</li>
                <li>Medium: 20 points per correct answer</li>
                <li>Hard: 30 points per correct answer</li>
              </ul>
              <p>You have three lives per game. Each incorrect answer costs one life.</p>
            </div>
          </div>

          {/* Time Limits */}
          <div className="bg-white/90 rounded-lg border-2 border-yellow-500 p-6">
            <h2 className="text-2xl font-bold text-[#4A2C00] mb-4 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-yellow-500" />
              Time Limits
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>Each difficulty level has a different time limit:</p>
              <ul className="list-disc list-inside pl-4 space-y-2">
                <li>Easy: 60 seconds</li>
                <li>Medium: 45 seconds</li>
                <li>Hard: 30 seconds</li>
              </ul>
              <p>The game ends when you run out of time or lives.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Bananas */}
      <div className="fixed bottom-0 left-0 w-24 h-24 transform -rotate-12">
        <Banana className="w-full h-full text-yellow-600 opacity-20" />
      </div>
      <div className="fixed top-0 right-0 w-24 h-24 transform rotate-45">
        <Banana className="w-full h-full text-yellow-600 opacity-20" />
      </div>
    </div>
  );
}