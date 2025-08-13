import React, { useState } from 'react';
import LoginForm from './components/LoginForm.jsx';
import Dashboard from './components/Dashboard.jsx';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Lógica de enrutamiento simple. En un proyecto real, se usaría react-router-dom.
  const renderContent = () => {
    if (isLoggedIn && isAdmin) {
      return <Dashboard />;
    } else if (isLoggedIn) {
      // Si el usuario no es admin, podría ver otra página o un mensaje
      return <div className="p-4 text-center">No tienes permisos para ver este dashboard.</div>;
    } else {
      return <LoginForm onLoginSuccess={() => { setIsLoggedIn(true); setIsAdmin(true); }} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {renderContent()}
    </div>
  );
}

export default App;
