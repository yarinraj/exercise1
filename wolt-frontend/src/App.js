import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Register from './components/register';
import Navbar from './components/navbar';
import 'bootstrap/dist/css/bootstrap.min.css'; // Globally injecting Bootstrap styles into the application
function App() {
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
            
            {/* 🌟 PUBLIC HOME PAGE ROUTE */}
            <Route path="/" element={
              <div style={{ position: 'relative', minHeight: '80vh', paddingTop: '20px' }}>
                
                {/* GUEST NAVIGATION BUTTONS: Rendered top-right ONLY when logged out */}
                {!user && (
                  <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '12px', zIndex: 1000 }}>
                    <Link to="/login" className="btn btn-outline-info rounded-pill px-4 fw-bold shadow-sm" style={{ borderWidth: '2px' }}>
                      Login
                    </Link>
                    <Link to="/signup" className="btn btn-info text-white rounded-pill px-4 fw-bold shadow-sm">
                      Sign up
                    </Link>
                  </div>
                )}
                
                {/* Main Homepage text content */}
                <div className="container text-center" style={{ marginTop: '80px' }}>
                  <h1 className="display-4 fw-bold mb-3">Welcome to bites Home Page!</h1>
                  <p className="lead text-secondary">This page is public and visible to everyone.</p>
                </div>

              </div>
            } />

            {/* TEMPORARY LOGIN PLACEHOLDER ROUTE */}
            <Route path="/login" element={
              <div className="container mt-5 text-center">
                <h2>Login Page Placeholder</h2>
                <p className="text-secondary">The login form will be implemented here later by Moran my expensive brother.</p>
                <Link to="/" className="btn btn-secondary btn-sm mt-3">Back to Home</Link>
              </div>
            } />

            {/* SIGNUP ROUTE: Protected against already logged-in users */}
            <Route path="/signup" element={!user ? <Register setUser={setUser} /> : <Navigate to="/" />} />

          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;