import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Componente para el formulario de inicio de sesi\u00f3n
const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Ajusta esta URL si tu backend no est\u00e1 en localhost:8085
      const response = await axios.post('http://localhost:8085/api/auth/login', { email, password });
      // Guarda el token de acceso en el almacenamiento local
      localStorage.setItem('accessToken', response.data.accessToken);
      onLoginSuccess();
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError('Ocurrio un error de conexión con el servidor.');
      }
      console.error(err);
    }
  };

  return (
    <div className="login-card w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl">
      {/* AQU\u00cd DEBES REEMPLAZAR LA URL DEL SRC POR LA URL P\u00daBLICA DE TU LOGO.
        Por ejemplo: src="https://tuservidor.com/images/logosinfondo_SGT-naranja1.png" 
      */}
      <img 
        src="https://i.ibb.co/BV0Xp3sF/logosinfondo-SGT-naranja1.png" 
        alt="Logo de la aplicación" 
        className="h-24 mx-auto mb-8"
      />
      <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8">Iniciar Sesión</h2>
      {error && <p className="text-red-500 text-center mb-4 font-semibold">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 text-base font-bold mb-2">Correo:</label>
          <input
            className="shadow-sm appearance-none border-2 border-gray-200 rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 text-base font-bold mb-2">Contraseña:</label>
          <input
            className="shadow-sm appearance-none border-2 border-gray-200 rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 w-full transition-colors duration-300 transform hover:scale-105"
          type="submit"
        >
          Entrar
        </button>
      </form>
    </div>
  );
};

// Componente del dashboard (p\u00e1gina principal despu\u00e9s del login)
const Dashboard = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('ADMINISTRADOR');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        onLogout();
        return;
      }
      try {
        const response = await axios.get('http://localhost:8085/api/users/profile', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setUser(response.data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        onLogout();
      }
    };
    fetchUser();
  }, [onLogout]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    onLogout();
    navigate('/');
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage('');
    const accessToken = localStorage.getItem('accessToken');
    try {
      await axios.post('http://localhost:8085/api/users/create', {
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole
      }, {
        headers: { Authorization: `Bearer ${accessToken}` },
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

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-red-600 transition-colors">Cerrar Sesi\u00f3n</button>
      </div>
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <p className="text-xl font-medium">Bienvenido, {user.email}</p>
        <p className="text-lg text-gray-600">Rol: {user.role}</p>
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
              <label className="block text-gray-700 text-sm font-bold mb-2">Contrase\u00f1a:</label>
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

// Componente principal de la aplicaci\u00f3n
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4 relative overflow-hidden">
        {/* AQU\u00cd DEBES REEMPLAZAR LA URL DEL BACKGROUND-IMAGE POR LA URL P\u00daBLICA DE TU FONDO.
          Por ejemplo: backgroundImage: `url(https://tuservidor.com/images/FondoLogin.png)`
        */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(https://i.ibb.co/tMJhgXxt/theme2.png)` }}
        ></div>
        <div className="relative z-10 flex justify-center items-center min-h-screen w-full">
          <Routes>
            <Route path="/" element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <LoginForm onLoginSuccess={handleLoginSuccess} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
