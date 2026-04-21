import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ThreatScanner from './pages/ThreatScanner';
import ThreatLogs from './pages/ThreatLogs';
import LoginAnomalyLogs from './pages/LoginAnomalyLogs';
import './index.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto px-4 py-6">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/scanner" element={<PrivateRoute><ThreatScanner /></PrivateRoute>} />
                <Route path="/threats" element={<PrivateRoute><ThreatLogs /></PrivateRoute>} />
                <Route path="/anomalies" element={<PrivateRoute><LoginAnomalyLogs /></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;