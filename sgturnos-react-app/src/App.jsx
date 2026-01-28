import VacacionesModuleV2 from './components/novedades/VacacionesModuleV2';
import IncapacidadesModule from './components/novedades/IncapacidadesModule';
import PermisosModule from './components/novedades/PermisosModule';
import CambiosTurnosModule from './components/novedades/CambiosTurnosModule';
import CalamidadModule from './components/novedades/CalamidadModule';
import AdminNovedades from './components/novedades/AdminNovedades';
import SelectorNovedades from './components/novedades/SelectorNovedades';
import JefeNovedadesRevisor from './components/novedades/JefeNovedadesRevisor';
import OperacionesNovedadesRevisor from './components/novedades/OperacionesNovedadesRevisor';
import RRHHNovedadesRevisor from './components/novedades/RRHHNovedadesRevisor';
import JefeInmediatoRevisor from './components/mallas/JefeInmediatoRevisor';
import RecursosHumanosRevisor from './components/mallas/RecursosHumanosRevisor';
import AlertasMalla from './components/mallas/AlertasMalla';
import BadgeNovedadesPendientes from './components/novedades/BadgeNovedadesPendientes';
import DashboardComponent from './components/Dashboard';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { api } from './api';
import { ToastProvider } from './components/common/ToastContainer';
import TurnosModule from './components/turnos/TurnosModule';
import PersonalMalla from './components/turnos/PersonalMalla';
import AdminPublishedMallas from './components/turnos/AdminPublishedMallas';
import MyAccount from './components/MyAccount';
import UserList from './components/UserList';
import LoginForm from './components/LoginForm';
import ErrorBoundary from './ErrorBoundary';

// Componente para la gestion de usuarios (usa la version actualizada con formularios separados)
const UserManagement = () => {
  return <UserList />;
};

// Componente del dashboard (pagina principal despues del login)
const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home'); // Estado para controlar la pestana activa
  const [novedadesTab, setNovedadesTab] = useState('registro'); // Tab para módulo de novedades (admin por defecto)
  const [createSignal, setCreateSignal] = useState(0); // señal para abrir formulario de creación
  const [novedadesMenuOpen, setNovedadesMenuOpen] = useState(false); // Control del submenú de novedades
  const [sidebarOpen, setSidebarOpen] = useState(false); // Control del sidebar responsivo
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Detectar si es móvil

  // Hook para detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Cerrar sidebar automáticamente si volvemos a desktop
      if (!mobile) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cerrar sidebar cuando se cambia de tab en móvil
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Verificar si el usuario es administrador
  const isAdmin = user && ((user.rol && user.rol.rol && String(user.rol.rol).toUpperCase().includes('ADMIN')) || (user.rol && user.rol.idRol && String(user.rol.idRol).toLowerCase().includes('adm')));

  const renderContent = () => {
    // Obtener nombre amigable del rol
    const getRoleName = () => {
      if (!user || !user.rol) return '';
      const roleId = (user.rol.idRol || user.rol.rol || '').toLowerCase();
      
      // Búsqueda parcial para IDs que incluyen números (ej: adm05, enf02)
      if (roleId.includes('adm')) return 'Administrador';
      if (roleId.includes('aux')) return 'Auxiliar';
      if (roleId.includes('enf')) return 'Enfermero';
      if (roleId.includes('med')) return 'Médico';
      if (roleId.includes('ter')) return 'Terapeuta';
      
      return roleId;
    };
    
    const isAdmin = user && ((user.rol && user.rol.rol && String(user.rol.rol).toUpperCase().includes('ADMIN')) || (user.rol && user.rol.idRol && String(user.rol.idRol).toLowerCase().includes('adm')));

    switch (activeTab) {
      case 'home':
        // Usar el nuevo Dashboard component
        return <DashboardComponent user={user} onLogout={onLogout} onNavigateToNovedades={(tipoNovedad) => {
          if (tipoNovedad) {
            setNovedadesTab(tipoNovedad);
          }
          setActiveTab('news');
        }} />;
      case 'myinfo':
        return <MyAccount user={user} />;
      case 'users':
        return <UserManagement />;
      case 'myturns':
        return <PersonalMalla user={user} />;
      case 'turns':
        return <TurnosModule user={user} />;
      case 'news':
        // Admin: vista principal de Registro de Novedades + filtros
        if (isAdmin && novedadesTab === 'registro') {
          return <AdminNovedades usuarioAdminId={user?.idUsuario} userName={`${user?.primerNombre || ''} ${user?.segundoNombre || ''} ${user?.primerApellido || ''} ${user?.segundoApellido || ''}`.trim()} userRol={user?.rol?.rol} />;
        }

        // Mostrar SelectorNovedades para usuarios regulares cuando están en el tab 'registro' o cuando no han seleccionado un submódulo
        if (novedadesTab === 'registro') {
          return <SelectorNovedades 
            onSelect={(tabName) => {
              setNovedadesTab(tabName);
            }} 
            onCreate={(tabName) => {
              setCreateSignal(prev => prev + 1);
              setNovedadesTab(tabName);
            }}
            userName={`${user?.primerNombre || ''} ${user?.segundoNombre || ''} ${user?.primerApellido || ''} ${user?.segundoApellido || ''}`.trim()}
            userRole={getRoleName()}
          />;
        }

        // Vista por módulo específico
        return (
          <div className="space-y-8">
            {novedadesTab === 'vacaciones' && (
              <VacacionesModuleV2 usuarioId={user?.idUsuario} userName={`${user?.primerNombre || ''} ${user?.segundoNombre || ''} ${user?.primerApellido || ''} ${user?.segundoApellido || ''}`.trim()} userRole={getRoleName()} openCreateSignal={createSignal} isAdmin={isAdmin} />
            )}
            {novedadesTab === 'incapacidades' && (
              <IncapacidadesModule usuarioId={user?.idUsuario} userName={`${user?.primerNombre || ''} ${user?.segundoNombre || ''} ${user?.primerApellido || ''} ${user?.segundoApellido || ''}`.trim()} userRole={getRoleName()} openCreateSignal={createSignal} isAdmin={isAdmin} />
            )}
            {novedadesTab === 'permisos' && (
              <PermisosModule usuarioId={user?.idUsuario} userName={`${user?.primerNombre || ''} ${user?.segundoNombre || ''} ${user?.primerApellido || ''} ${user?.segundoApellido || ''}`.trim()} userRole={getRoleName()} openCreateSignal={createSignal} isAdmin={isAdmin} />
            )}
            {novedadesTab === 'cambios' && (
              <CambiosTurnosModule usuarioId={user?.idUsuario} userName={`${user?.primerNombre || ''} ${user?.segundoNombre || ''} ${user?.primerApellido || ''} ${user?.segundoApellido || ''}`.trim()} userRole={getRoleName()} openCreateSignal={createSignal} isAdmin={isAdmin} />
            )}
            {novedadesTab === 'calamidad' && (
              <CalamidadModule usuarioId={user?.idUsuario} userName={`${user?.primerNombre || ''} ${user?.segundoNombre || ''} ${user?.primerApellido || ''} ${user?.segundoApellido || ''}`.trim()} userRole={getRoleName()} openCreateSignal={createSignal} isAdmin={isAdmin} />
            )}
          </div>
        );
      case 'jefe-revisor':
        return <JefeInmediatoRevisor usuarioId={user?.idUsuario} />;
      case 'jefe-novedades':
        return <JefeNovedadesRevisor usuarioId={user?.idUsuario} userName={`${user?.primerNombre || ''} ${user?.segundoNombre || ''} ${user?.primerApellido || ''} ${user?.segundoApellido || ''}`.trim()} />;
      case 'operaciones-novedades':
        return <OperacionesNovedadesRevisor usuarioId={user?.idUsuario} userName={`${user?.primerNombre || ''} ${user?.segundoNombre || ''} ${user?.primerApellido || ''} ${user?.segundoApellido || ''}`.trim()} />;
      case 'rrhh-novedades':
        return <RRHHNovedadesRevisor usuarioId={user?.idUsuario} userName={`${user?.primerNombre || ''} ${user?.segundoNombre || ''} ${user?.primerApellido || ''} ${user?.segundoApellido || ''}`.trim()} />;
      case 'rrhh-revisor':
        return <RecursosHumanosRevisor usuarioId={user?.idUsuario} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Overlay móvil para cerrar sidebar */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar de navegacion - Responsivo */}
      <aside className={`${
        isMobile 
          ? `fixed left-0 top-0 h-full w-64 z-40 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}` 
          : 'w-64 relative'
      } bg-gray-800 text-white flex flex-col p-6 rounded-r-3xl shadow-xl`}>
        <div className="flex-shrink-0 flex items-center mb-8 justify-between">
          <div className="flex items-center">
            <img src="https://i.ibb.co/BV0Xp3sF/logosinfondo-SGT-naranja1.png" alt="Logo" className="w-12 h-12 mr-3"/>
            <h2 className="text-2xl font-bold">SGTurnos</h2>
          </div>
          {/* Botón cerrar sidebar en móvil */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:bg-gray-700 p-2 rounded-lg md:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <nav className="flex-grow">
          <ul>
            <li>
              <button
                onClick={() => handleTabChange('home')}
                className={`w-full text-left py-3.5 px-5 rounded-xl font-semibold text-base md:text-lg transition-colors duration-200 mb-2 ${activeTab === 'home' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700'}`}
              >
                Inicio
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
                      className={`w-full text-left py-3.5 px-5 rounded-xl font-semibold text-base md:text-lg transition-colors duration-200 mb-2 ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700'}`}
                    >
                      Usuarios
                    </button>
                  );
                }
                return (
                  <button
                    onClick={() => setActiveTab('myinfo')}
                    className={`w-full text-left py-3.5 px-5 rounded-xl font-semibold text-base md:text-lg transition-colors duration-200 mb-2 ${activeTab === 'myinfo' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700'}`}
                  >
                    Información de mi usuario
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
                      className={`w-full text-left py-3.5 px-5 rounded-xl font-semibold text-base md:text-lg transition-colors duration-200 mb-2 ${activeTab === 'turns' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700'}`}
                    >
                      Turnos
                    </button>
                  );
                }
                return (
                  <button
                    onClick={() => setActiveTab('myturns')}
                    className={`w-full text-left py-3.5 px-5 rounded-xl font-semibold text-base md:text-lg transition-colors duration-200 mb-2 ${activeTab === 'myturns' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700'}`}
                  >
                    Consultar mi malla de turno
                  </button>
                );
              })()}
            </li>
            <li>
              {/* Botón principal de Novedades con submenú */}
              <button
                onClick={() => {
                  setActiveTab('news');
                  setNovedadesTab('registro');
                }}
                className={`w-full text-left py-3.5 px-5 rounded-xl font-semibold text-base md:text-lg transition-colors duration-200 mb-2 flex items-center justify-between ${activeTab === 'news' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700'}`}
              >
                <span className="flex items-center gap-2">
                  Novedades
                  <span
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNovedadesMenuOpen(!novedadesMenuOpen);
                    }}
                  >
                    {novedadesMenuOpen ? '▼' : '▶'}
                  </span>
                </span>
                <BadgeNovedadesPendientes rol={user?.rol?.rol} />
              </button>
              
              {/* Submenú de Novedades */}
              {novedadesMenuOpen && (
                <ul className="ml-4 mt-1 space-y-1">
                  <li>
                    <button
                      onClick={() => {
                        setActiveTab('news');
                        setNovedadesTab('vacaciones');
                      }}
                      className={`w-full text-left py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                        activeTab === 'news' && novedadesTab === 'vacaciones'
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      }`}
                    >
                      <span>🏖️</span>
                      <span>Vacaciones</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setActiveTab('news');
                        setNovedadesTab('permisos');
                      }}
                      className={`w-full text-left py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                        activeTab === 'news' && novedadesTab === 'permisos'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      }`}
                    >
                      <span>✅</span>
                      <span>Permisos</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setActiveTab('news');
                        setNovedadesTab('incapacidades');
                      }}
                      className={`w-full text-left py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                        activeTab === 'news' && novedadesTab === 'incapacidades'
                          ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      }`}
                    >
                      <span>🏥</span>
                      <span>Incapacidades</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setActiveTab('news');
                        setNovedadesTab('calamidad');
                      }}
                      className={`w-full text-left py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                        activeTab === 'news' && novedadesTab === 'calamidad'
                          ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      }`}
                    >
                      <span>⚠️</span>
                      <span>Calamidades</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setActiveTab('news');
                        setNovedadesTab('cambios');
                      }}
                      className={`w-full text-left py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                        activeTab === 'news' && novedadesTab === 'cambios'
                          ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white shadow-md'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      }`}
                    >
                      <span>🔄</span>
                      <span>Cambios de Turno</span>
                    </button>
                  </li>
                </ul>
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
          </ul>
        </nav>
        <div className="mt-auto">
          <button onClick={onLogout} className="w-full bg-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-700 transition-colors duration-200 shadow-lg">
            Cerrar Sesion
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${isMobile ? 'p-3 sm:p-4' : 'p-4 sm:p-6 lg:p-8'}`}>
        {/* Botón hamburger en móvil */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden flex items-center justify-center bg-gray-800 text-white p-3 rounded-lg mb-4 w-full hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="ml-2 font-semibold">Menú</span>
          </button>
        )}
        <div className="w-full">
          {renderContent()}
        </div>
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
      console.log('Intentando obtener perfil del usuario...');
      
      // Crear un timeout de 10 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await api.get('/usuarios/profile', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('Perfil obtenido:', response.data);
      setUser(response.data);
      setIsLoading(false);
      if (location.pathname === '/login') {
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
      console.error('Error code:', error.code);
      console.error('Error response status:', error.response?.status);
      console.error('Error response data:', error.response?.data);
      setUser(null);
      setIsLoading(false);
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('App cargando... Token existe:', !!token);
    console.log('Location pathname:', location.pathname);
    
    if (token && location.pathname !== '/login') {
      console.log('Token existe, obteniendo perfil...');
      fetchUserProfile();
    } else {
      console.log('No hay token o estamos en login');
      setIsLoading(false);
      if (!token && location.pathname !== '/login') {
        console.log('Redirigiendo a login...');
        navigate('/login');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <ToastProvider>
          <App />
        </ToastProvider>
      </ErrorBoundary>
    </Router>
  );
}
