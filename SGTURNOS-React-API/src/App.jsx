import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import CrearUsuario from './components/CrearUsuario';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/crear-usuario" element={<CrearUsuario />} />
    </Routes>
  );
};

export default App;