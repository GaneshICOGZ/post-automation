import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreatePost from './pages/CreatePost';
import PostHistory from './pages/PostHistory';
import Navbar from './components/Navbar';
import { AuthContext } from './context/AuthContext';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('token');
    if (token) {
      // For now, we'll validate the token exists
      // In a real app, you'd validate with the backend
      setUser({ token: token }); // Set basic user object
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {user && <Navbar />}
          <Routes>
            <Route
              path="/login"
              element={user ? <Navigate to="/dashboard" /> : <Login />}
            />
            <Route
              path="/signup"
              element={user ? <Navigate to="/dashboard" /> : <Signup />}
            />
            <Route
              path="/dashboard"
              element={user ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/create-post"
              element={user ? <CreatePost /> : <Navigate to="/login" />}
            />
            <Route
              path="/history"
              element={user ? <PostHistory /> : <Navigate to="/login" />}
            />
            <Route
              path="/"
              element={<Navigate to={user ? "/dashboard" : "/login"} />}
            />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
