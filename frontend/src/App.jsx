import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AwsCredentialBanner from './components/AwsCredentialBanner';
import LandingPage from './pages/LandingPage';
import HowItWorksPage from './pages/HowItWorksPage';
import RequirementFormPage from './pages/RequirementFormPage';
import RecommendationPage from './pages/RecommendationPage';
import AboutPage from './pages/AboutPage';
import DeploymentStatusPage from './pages/DeploymentStatusPage';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './context/AuthContext';
import './index.css';

function App() {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header theme={theme} onToggleTheme={toggleTheme} />
          <AwsCredentialBanner />
          <main>
            <Routes>
              <Route path="/"              element={<LandingPage />} />
              <Route path="/login"         element={<LoginPage />} />
              <Route path="/how-it-works"  element={<HowItWorksPage />} />
              <Route path="/requirements"  element={<RequirementFormPage />} />
              <Route path="/recommendation"element={<RecommendationPage />} />
              <Route path="/about"         element={<AboutPage />} />
              <Route path="/deploy"        element={<DeploymentStatusPage />} />
              <Route path="/history"       element={<HistoryPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
