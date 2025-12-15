import VacacionesModuleV2 from './components/novedades/VacacionesModuleV2';
import IncapacidadesModule from './components/novedades/IncapacidadesModule';
import AprobadorVacaciones from './components/novedades/AprobadorVacaciones';
import AdminNovedades from './components/novedades/AdminNovedades';
import JefeInmediatoRevisor from './components/mallas/JefeInmediatoRevisor';
import RecursosHumanosRevisor from './components/mallas/RecursosHumanosRevisor';
import AlertasMalla from './components/mallas/AlertasMalla';
import BadgeAlertas from './components/mallas/BadgeAlertas';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { api } from './api';
import TurnosModule from './components/turnos/TurnosModule';
import PersonalMalla from './components/turnos/PersonalMalla';
import AdminPublishedMallas from './components/turnos/AdminPublishedMallas';
import MyAccount from './components/MyAccount';
import UserList from './components/UserList';
import ErrorBoundary from './ErrorBoundary';

// Componente para el formulario de inicio de sesion
const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Peticion para iniciar sesion usando la instancia api
      const response = await api.post('/auth/login', { email, password });
      
      // Guarda el token de acceso en el almacenamiento local
      localStorage.setItem('token', response.data.accessToken);
      
      // Llama a la funcion para manejar el exito del login
      onLoginSuccess();
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError('Ocurrio un error de conexion con el servidor.');
      }
      console.error(err);
    }
  };

  return (
    <div className="relative w-full max-w-lg p-10 bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-3xl shadow-2xl transition-all duration-500 transform hover:scale-105">
      {/* Titulos y subtitulos anadidos */}
      <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-2">Sistema de Gestion de Turnos</h1>
      <h2 className="text-xl font-medium text-center text-gray-700 mb-8">SGTurnos</h2>

      <img
        src="https://i.ibb.co/BV0Xp3sF/logosinfondo-SGT-naranja1.png"
        alt="Logo de la aplicacion"
        className="h-40 mx-auto mb-8 animate-pulse-slow"
      />
      <h3 className="text-3xl font-bold text-center text-gray-800 mb-8">Iniciar Sesion</h3>
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
          <label className="block text-gray-700 text-base font-bold mb-2">Contrasena:</label>
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

// Componente para la gestion de usuarios (usa la version actualizada con formularios separados)
const UserManagement = () => {
  return <UserList />;
};

// Componente del dashboard (pagina principal despues del login)
const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home'); // Estado para controlar la pestana activa
  const [novedadesTab, setNovedadesTab] = useState('vacaciones'); // Tab para módulo de novedades
  const [expandNovedades, setExpandNovedades] = useState(false); // Estado para expandir/contraer submenu de novedades

  // Verificar si el usuario es administrador
  const isAdmin = user && ((user.rol && user.rol.rol && String(user.rol.rol).toUpperCase().includes('ADMIN')) || (user.rol && user.rol.idRol && String(user.rol.idRol).toLowerCase().includes('adm')));

  const renderContent = () => {
    // Obtener nombre amigable del rol
    const getRoleName = () => {
      if (!user || !user.rol) return '';
      const roleId = (user.rol.idRol || user.rol.rol || '').toLowerCase();
      const roleMap = { 'aux01': 'Auxiliar', 'enf02': 'Enfermero', 'med03': 'Médico', 'ter04': 'Terapeuta', 'adm': 'Administrador' };
      return roleMap[roleId] || roleId;
    };
    
    const isAdmin = user && ((user.rol && user.rol.rol && String(user.rol.rol).toUpperCase().includes('ADMIN')) || (user.rol && user.rol.idRol && String(user.rol.idRol).toLowerCase().includes('adm')));

    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
              <h2 className="text-3xl font-medium text-gray-800 mb-4">
                Bienvenido, {user?.primerNombre} 
                {user?.rol && <span className="text-sm text-gray-500 ml-2">({getRoleName()})</span>}
              </h2>
              <p className="text-lg text-gray-600">
                {isAdmin ? 'Este es tu panel de control de administrador.' : 'Consulta tu malla de turno publicada.'}
              </p>
            </div>
            
            {/* Mostrar alertas solo para administradores */}
            {isAdmin && (
              <div className="mb-6">
                <AlertasMalla usuarioId={user?.idUsuario} />
              </div>
            )}
            
            {isAdmin ? <AdminPublishedMallas /> : <PersonalMalla user={user} />}
          </div>
          
        );
      case 'myinfo':
        return <MyAccount user={user} />;
      case 'users':
        return <UserManagement />;
      case 'myturns':
        return <PersonalMalla user={user} />;
      case 'turns':
        return <TurnosModule user={user} />;
      case 'news':
        if (isAdmin) {
          return <AdminNovedades usuarioAdminId={user?.idUsuario} />;
        }

        return (
          <div className="space-y-6">
            {/* Tabs para módulos de novedades */}
            <div className="bg-white rounded-lg shadow-lg p-4 flex flex-wrap gap-2">
              <button
                onClick={() => setNovedadesTab('vacaciones')}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  novedadesTab === 'vacaciones'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Vacaciones
              </button>
              <button
                onClick={() => setNovedadesTab('incapacidades')}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  novedadesTab === 'incapacidades'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Incapacidades
              </button>
            </div>

            {/* Contenido según tab seleccionado */}
            {novedadesTab === 'vacaciones' && (
              <VacacionesModuleV2 usuarioId={user?.idUsuario} userName={`${user?.primerNombre} ${user?.primerApellido}`} />
            )}
            {novedadesTab === 'incapacidades' && (
              <IncapacidadesModule usuarioId={user?.idUsuario} userName={`${user?.primerNombre} ${user?.primerApellido}`} />
            )}
          </div>
        );
      case 'approvals':
        return <AprobadorVacaciones usuarioId={user?.idUsuario} userName={`${user?.primerNombre} ${user?.primerApellido}`} />;
      case 'jefe-revisor':
        return <JefeInmediatoRevisor usuarioId={user?.idUsuario} />;
      case 'rrhh-revisor':
        return <RecursosHumanosRevisor usuarioId={user?.idUsuario} />;
      case 'other':
        return (
          <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Otros Modulos</h2>
            <p className="text-lg text-gray-600 mt-4">Proximamente podras ver mas modulos aqui.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar de navegacion */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-6 rounded-r-3xl shadow-xl">
        <div className="flex-shrink-0 flex items-center mb-8">
          <img src="https://i.ibb.co/BV0Xp3sF/logosinfondo-SGT-naranja1.png" alt="Logo" className="w-12 h-12 mr-3"/>
          <h2 className="text-2xl font-bold">SGTurnos</h2>
        </div>
        <nav className="flex-grow">
          <ul>
            <li>
              <button
                onClick={() => setActiveTab('home')}
                className={`w-full text-left py-3 px-4 rounded-xl font-semibold transition-colors duration-200 mb-2 flex items-center justify-between ${activeTab === 'home' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700'}`}
              >
                <span>Inicio</span>
                {isAdmin && <BadgeAlertas />}
              </button>
            </li>
            <li>
              {(() => {
                // show 'Gestion de Usuarios' only for admin; otherwise show 'Informacion de mi usuario'
                const isAdminLocal = user && ((user.rol && user.rol.rol && String(user.rol.rol).toUpperCase().includes('ADMIN')) || (user.rol && user.rol.idRol && String(user.rol.idRol).toLowerCase().includes('adm')));
                if (isAdminLocal) {
                  return (
                    <button
                      onClick={() => setActiveTab('users')}
                      className={`w-full text-left py-3 px-4 rounded-xl font-semibold transition-colors duration-200 mb-2 ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700'}`}
                    >
                      Gestion de Usuarios
                    </button>
                  );
                }
                return (
                  <button
                    onClick={() => setActiveTab('myinfo')}
                    className={`w-full text-left py-3 px-4 rounded-xl font-semibold transition-colors duration-200 mb-2 ${activeTab === 'myinfo' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700'}`}
                  >
                    INFORMACION DE MI USUARIO
                  </button>
                );
              })()}
            </li>
            <li>
              {(() => {
                const isAdminLocal = user && ((user.rol && user.rol.rol && String(user.rol.rol).toUpperCase().includes('ADMIN')) || (user.rol && user.rol.idRol && String(user.rol.idRol).toLowerCase().includes('adm')));
                if (isAdminLocal) {
                  return (
                    <button
                      onClick={() => setActiveTab('turns')}
                      className={`w-full text-left py-3 px-4 rounded-xl font-semibold transition-colors duration-200 mb-2 ${activeTab === 'turns' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700'}`}
                    >
                      Gestion de Turnos
                    </button>
                  );
                }
                return (
                  <button
                    onClick={() => setActiveTab('myturns')}
                    className={`w-full text-left py-3 px-4 rounded-xl font-semibold transition-colors duration-200 mb-2 ${activeTab === 'myturns' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700'}`}
                  >
                    Consultar mi malla de turno
                  </button>
                );
              })()}
            </li>
            <li>
              <button
                onClick={() => setExpandNovedades(!expandNovedades)}
                className={`w-full text-left py-3 px-4 rounded-xl font-semibold transition-colors duration-200 mb-2 flex justify-between items-center ${activeTab === 'news' || activeTab === 'approvals' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700'}`}
              >
                <span>Gestión de Novedades</span>
                <span className={`transition-transform duration-200 ${expandNovedades ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {expandNovedades && (
                <div className="ml-4 mt-2 space-y-2 border-l-2 border-blue-400 pl-2">
                  <button
                    onClick={() => { setActiveTab('news'); setExpandNovedades(false); }}
                    className={`w-full text-left py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${activeTab === 'news' ? 'bg-blue-500 text-white' : 'hover:bg-gray-700'}`}
                  >
                    📋 Solicitar Novedad
                  </button>
                  <button
                    onClick={() => { setActiveTab('approvals'); setExpandNovedades(false); }}
                    className={`w-full text-left py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${activeTab === 'approvals' ? 'bg-purple-500 text-white' : 'hover:bg-gray-700'}`}
                  >
                    ✅ Aprobaciones de Vacaciones
                  </button>
                </div>
              )}
            </li>
            
            {/* Menú de roles administrativos */}
            {(() => {
              const rolUsuario = user?.rol?.rol || '';
              if (rolUsuario === 'Jefe Inmediato') {
                return (
                  <li>
                    <button
                      onClick={() => setActiveTab('jefe-revisor')}
                      className={`w-full text-left py-3 px-4 rounded-xl font-semibold transition-colors duration-200 mb-2 ${activeTab === 'jefe-revisor' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700'}`}
                    >
                      📋 Revisar Mallas
                    </button>
                  </li>
                );
              }
              if (rolUsuario === 'Operaciones Clínicas') {
                return (
                  <li>
                    <button
                      onClick={() => setActiveTab('operaciones')}
                      className={`w-full text-left py-3 px-4 rounded-xl font-semibold transition-colors duration-200 mb-2 ${activeTab === 'operaciones' ? 'bg-green-600 text-white shadow-md' : 'hover:bg-gray-700'}`}
                    >
                      🏥 Gestionar Mallas
                    </button>
                  </li>
                );
              }
              if (rolUsuario === 'Recursos Humanos') {
                return (
                  <li>
                    <button
                      onClick={() => setActiveTab('rrhh-revisor')}
                      className={`w-full text-left py-3 px-4 rounded-xl font-semibold transition-colors duration-200 mb-2 ${activeTab === 'rrhh-revisor' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-gray-700'}`}
                    >
                      💼 Revisar para Nómina
                    </button>
                  </li>
                );
              }
              return null;
            })()}
            
            <li>
              <button
                onClick={() => setActiveTab('other')}
                className={`w-full text-left py-3 px-4 rounded-xl font-semibold transition-colors duration-200 mb-2 ${activeTab === 'other' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700'}`}
              >
                Otros Módulos
              </button>
            </li>
          </ul>
        </nav>
        <div className="mt-auto">
          <button onClick={onLogout} className="w-full bg-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-700 transition-colors duration-200 shadow-lg">
            Cerrar Sesion
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto p-8">
        {renderContent()}
      </main>
    </div>
  );
};

// Componente que maneja el enrutamiento y la logica principal de la aplicacion
const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Funcion para obtener el perfil del usuario
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleLoginSuccess = () => {
    fetchUserProfile(); // Llama a la funcion sin argumentos, ya que el interceptor maneja el token
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

// La funcion principal se exporta envuelta en BrowserRouter

export default function AppWrapper() {
  return (
    <Router>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </Router>
  );
}
