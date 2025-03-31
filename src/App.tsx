import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DifficultyPage } from './pages/DifficultyPage';
import { GamePage } from './pages/GamePage';
import { DailyChallengeGame } from './pages/DailyChallengeGame';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { HelpPage } from './pages/HelpPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainMenu } from './pages/MainMenu';
import Footer from './components/Footer';
// import Header from './components/Header';


function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/difficulty" element={
        <ProtectedRoute>
            <DifficultyPage />
          <Footer />
        </ProtectedRoute>
      } />
      <Route path="/game/:difficulty" element={
        <ProtectedRoute>
            <GamePage />
          <Footer />
        </ProtectedRoute>
      } />
      <Route path="/daily-challenge" element={
        <ProtectedRoute>
          <DailyChallengeGame />
        </ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute>
          <LeaderboardPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
          <Footer />
        </ProtectedRoute>
      } />
      <Route path="/help" element={
        <ProtectedRoute>
          <HelpPage />
          <Footer />
        </ProtectedRoute>
      } />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainMenu />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

