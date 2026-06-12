import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Register from './components/register';
import Login from './components/Login'; 
import Navbar from './components/navbar';
import 'bootstrap/dist/css/bootstrap.min.css'; // Globally injecting Bootstrap styles into the application
import ProtectedRoute from './components/ProtectedRoute';
import RestaurantFeed from "./components/RestaurantFeed"

const App = () => {
  const [user, setUser] = useState(null);
  // Check if a user session already exists on page load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

return (
    <Router>
      <div className="App">
{/* NAVBAR: Rendered globally, but ONLY if the user is logged in */}
        {user && <Navbar user={user} setUser={setUser} />}

        <div className="main-content">
          <Routes>
            {/* PUBLIC HOME PAGE OR DASHBOARD */}
            <Route path="/" element={
              user ? (
                /* Dashboard for logged-in users */
                <div className="container mt-5 text-center">
                  <h1>Welcome to bites Dashboard!</h1>
                  <p>Main content and restaurant listings will appear here.</p>
                </div>
              ) : (
                /* Public Home Page for guests */
                <div style={{ position: 'relative', minHeight: '80vh', paddingTop: '20px' }}>
                  <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '12px', zIndex: 1000 }}>
                    <Link to="/login" className="btn btn-outline-info rounded-pill px-4 fw-bold shadow-sm" style={{ borderWidth: '2px' }}>
                      Login
                    </Link>
                    <Link to="/register" className="btn btn-info text-white rounded-pill px-4 fw-bold shadow-sm">
                      Sign up
                    </Link>
                  </div>
                  
                  <div className="container text-center" style={{ marginTop: '80px' }}>
                    <h1 className="display-4 fw-bold mb-3">Welcome to bites Home Page!</h1>
                    <p className="lead text-secondary">This page is public and visible to everyone.</p>
                  </div>
                </div>
              )
            } />

            {/* LOGIN ROUTE: Real component, redirects to home if already logged in */}
            {/* Public Routes */}
            {/* a homepage - <Route path="/" element={<HomePage />} /> */}
            {/* <Route path="/login" element={<Login />} /> */}
            <Route 
              path="/login" 
              element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} 
            />

            {/* REGISTER ROUTE: Real component, redirects to home if already logged in */}
            <Route 
              path="/register" 
              element={!user ? <Register setUser={setUser} /> : <Navigate to="/" />} 
            />
            
            {/* Catch-all for /signup to redirect to /register */}
            <Route 
              path="/signup" 
              element={!user ? <Register setUser={setUser} /> : <Navigate to="/" />} 
            />

          {/* Protected Routes - Only accessible with a token */}
            <Route element={<ProtectedRoute />}>
                <Route path="/restaurants" element={<RestaurantFeed />} />
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
