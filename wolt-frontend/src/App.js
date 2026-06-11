import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/register';
import Login from './components/Login'; 
import Navbar from './components/navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [user, setUser] = useState(null);

  // Check if a user session already exists in localStorage on initial page load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <Router>
      <div className="App">
        {/* Render Navbar only if the user is authenticated */}
        {user && <Navbar user={user} setUser={setUser} />}

        <div className="main-content">
          {/* Use Routes to manage navigation between Login, Register, and Dashboard */}
          <Routes>
            {/* Redirect to dashboard if logged in, otherwise show Login page */}
            <Route 
              path="/login" 
              element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} 
            />
            
            {/* Redirect to dashboard if logged in, otherwise show Register page */}
            <Route 
              path="/register" 
              element={!user ? <Register setUser={setUser} /> : <Navigate to="/" />} 
            />
            
            {/* Protected Dashboard route: Show content if authenticated, else redirect to login */}
            <Route 
              path="/" 
              element={user ? (
                <div className="container mt-5 text-center">
                  <h1>Welcome to bites Dashboard!</h1>
                  <p>Main content and restaurant listings will appear here.</p>
                </div>
              ) : (
                <Navigate to="/login" />
              )} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;