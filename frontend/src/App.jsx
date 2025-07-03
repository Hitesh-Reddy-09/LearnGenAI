import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Generate from './pages/Generate';
import Course from './pages/Course';
import Dashboard from './pages/Dashboard';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br dark:from-black dark:via-gray-900 dark:to-gray-800 from-white via-gray-50 to-gray-100 dark:text-white text-gray-900 overflow-x-hidden transition-colors duration-300">
      <Header />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route 
            path="/generate" 
            element={
              <ProtectedRoute>
                <Generate />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/course" 
            element={
              <ProtectedRoute>
                <Course />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/course/:id" 
            element={
              <ProtectedRoute>
                <Course />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AnimatePresence>
      <Footer />
    </div>
  );
}

export default App;