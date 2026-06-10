import React from 'react';
import Register from './components/register';
import 'bootstrap/dist/css/bootstrap.min.css'; // Globally injecting Bootstrap styles into the application

function App() {
  return (
    <div className="App">
      {/* Rendering the newly designed Wolt registration form layout */}
      <Register />
    </div>
  );
}

export default App;