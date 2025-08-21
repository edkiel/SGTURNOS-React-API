import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { api } from './api';

// Componente para el formulario de inicio de sesi\u00f3n
const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Petición para iniciar sesi\u00F3n usando la instancia api
      const response = await api.post('/auth/login', { email, password });
      
      // Guarda el token de acceso en el almacenamiento local
      localStorage.setItem('token', response.data.accessToken);
      
      // Llama a la funci\u00F3n para manejar el \u00E9xito del login
      onLoginSuccess();
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError('Ocurri\u00F3 un error de conexi\u00F3n con el servidor.');
      }
      console.error(err);
    }
  };

  return (
    <div className="relative w-full max-w-lg p-10 bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-3xl shadow-2xl transition-all duration-500 transform hover:scale-105">
      {/* T\u00edtulos y subt\u00edtulos a\u00f1adidos */}
      <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-2">Sistema de Gestión de Turnos</h1>
      <h2 className="text-xl font-medium text-center text-gray-700 mb-8">SGTurnos</h2>

      <img
        src="https://i.ibb.co/BV0Xp3sF/logosinfondo-SGT-naranja1.png"
        alt="Logo de la aplicaci\u00f3n"
        className="h-40 mx-auto mb-8 animate-pulse-slow"
      />
      <h3 className="text-3xl font-bold text-center text-gray-800 mb-8">Iniciar Sesión</h3>
      {error && <p className="text-red-500 text-center mb-4 font-semibold">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 text-base font-bold mb-2">Correo:</label>
          <input
            className="shadow-inner appearance-none border-2 border-gray-300 rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 transform hover:scale-105"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 text-base font-bold mb-2">Contraseña:</label>
          <input
            className="shadow-inner appearance-none border-2 border-gray-300 rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 transform hover:scale-105"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 w-full transition-colors duration-300 transform hover:scale-105 shadow-xl"
          type="submit"
        >
          Entrar
        </button>
      </form>
    </div>
  );
};

// Componente del dashboard (p\u00E1gina principal despu\u00E9s del login)
const Dashboard = ({ user, onLogout }) => {
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('ADMINISTRADOR');
  const [message, setMessage] = useState('');

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/users/create', {
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole
      });
      setMessage('Usuario creado exitosamente.');
      setNewUserEmail('');
      setNewUserPassword('');
    } catch (err) {
      if (err.response && err.response.data) {
        setMessage(err.response.data.message);
      } else {
        setMessage('Error al crear el usuario.');
      }
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
        <button onClick={onLogout} className="bg-red-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-red-600 transition-colors">Cerrar Sesi\u00f3n</button>
      </div>
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <p className="text-xl font-medium">Bienvenido, {user?.primerNombre}!</p>
        <p className="text-lg text-gray-600">Rol: {user?.role}</p>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Crear Nuevo Usuario</h2>
        <div className="bg-white p-8 rounded-xl shadow-lg">
          {message && (
            <div className={`p-4 mb-4 rounded-xl text-white ${message.includes('exitosamente') ? 'bg-green-500' : 'bg-red-500'}`}>
              {message}
            </div>
          )}
          <form onSubmit={handleCreateUser} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Correo:</label>
              <input
                className="input-field"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña:</label>
              <input
                className="input-field"
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Rol:</label>
              <select
                className="input-field"
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
              >
                <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                <option value="USUARIO">USUARIO</option>
              </select>
            </div>
            <button
              className="login-btn bg-green-500 hover:bg-green-700 focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Crear Usuario
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Componente que maneja el enrutamiento y la l\u00f3gica principal de la aplicaci\u00f3n
const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Funci\u00f3n para obtener el perfil del usuario
  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/usuarios/profile');
      setUser(response.data);
      setIsLoading(false);
      if (location.pathname === '/login') {
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
      setIsLoading(false);
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && location.pathname !== '/login') {
      fetchUserProfile();
    } else {
      setIsLoading(false);
      if (!token && location.pathname !== '/login') {
        navigate('/login');
      }
    }
  }, [location.pathname]);

  const handleLoginSuccess = () => {
    fetchUserProfile(); // Llama a la funci\u00f3n sin argumentos, ya que el interceptor maneja el token
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(https://i.ibb.co/tMJhgXxt/theme2.png)` }}
      ></div>
      <div className="relative z-10 flex justify-center items-center min-h-screen w-full">
        <Routes>
          <Route path="/login" element={<LoginForm onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/" element={
            user ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <LoginForm onLoginSuccess={handleLoginSuccess} />
            )
          } />
        </Routes>
      </div>
    </div>
  );
};

// La funci\u00f3n principal se exporta envuelta en BrowserRouter
export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
