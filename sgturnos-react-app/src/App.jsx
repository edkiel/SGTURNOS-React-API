import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { api } from './api';
import TurnosModule from './components/turnos/TurnosModule';
import PersonalMalla from './components/turnos/PersonalMalla';

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

// Componente para la gestion de usuarios
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({
    idUsuario: '',
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    idRol: 'aux01', // Valor por defecto
    correo: '',
    contrasena: ''
  });
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('all');

  // Funcion para obtener la lista de usuarios
  const fetchUsers = async () => {
    try {
      const response = await api.get('/usuarios');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setMessage('Error al cargar la lista de usuarios.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Funcion para manejar los cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Funcion para crear o editar un usuario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      if (editingUserId) {
        // Logica para editar usuario
        await api.put(`/usuarios/update/${editingUserId}`, formData);
        setMessage('Usuario actualizado exitosamente.');
      } else {
        // Logica para crear usuario
        await api.post('/auth/register', formData);
        setMessage('Usuario creado exitosamente.');
      }
      resetForm(); // Resetea el formulario
      setEditingUserId(null); // Sale del modo edicion
      fetchUsers(); // Actualiza la lista de usuarios
    } catch (err) {
      if (err.response && err.response.data) {
        setMessage(err.response.data.message || err.response.data);
      } else {
        setMessage('Error en la operacion.');
      }
      console.error(err);
    }
  };
  
  // Funcion para resetear el formulario
  const resetForm = () => {
    setFormData({
      idUsuario: '',
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      idRol: 'aux01',
      correo: '',
      contrasena: ''
    });
  };

  // Funcion para iniciar el modo de edicion
  const handleEditUser = (userData) => {
    setEditingUserId(userData.idUsuario);
    setFormData({
      idUsuario: userData.idUsuario,
      primerNombre: userData.primerNombre,
      segundoNombre: userData.segundoNombre || '',
      primerApellido: userData.primerApellido,
      segundoApellido: userData.segundoApellido || '',
      idRol: userData.rol.idRol,
      correo: userData.correo,
      contrasena: '' // La contrasena no se precarga por seguridad
    });
  };

  // Funcion para eliminar un usuario
  const handleDeleteUser = async (userId) => {
    setMessage('');
    try {
      await api.delete(`/usuarios/delete/${userId}`);
      setMessage('Usuario eliminado exitosamente.');
      fetchUsers();
    } catch (err) {
      if (err.response && err.response.data) {
        setMessage(err.response.data.message);
      } else {
        setMessage('Error al eliminar el usuario.');
      }
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">{editingUserId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
        {message && (
          <div className={`p-4 mb-4 rounded-xl text-white ${message.includes('exitosamente') ? 'bg-green-500' : 'bg-red-500'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Id Usuario:</label>
              <input
                className="shadow-inner appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="number"
                name="idUsuario"
                value={formData.idUsuario}
                onChange={handleInputChange}
                required
                disabled={editingUserId !== null}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Primer Nombre:</label>
              <input
                className="shadow-inner appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                name="primerNombre"
                value={formData.primerNombre}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Segundo Nombre:</label>
              <input
                className="shadow-inner appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                name="segundoNombre"
                value={formData.segundoNombre}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Primer Apellido:</label>
              <input
                className="shadow-inner appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                name="primerApellido"
                value={formData.primerApellido}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Segundo Apellido:</label>
              <input
                className="shadow-inner appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                name="segundoApellido"
                value={formData.segundoApellido}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Rol:</label>
              <select
                className="shadow-inner appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                name="idRol"
                value={formData.idRol}
                onChange={handleInputChange}
              >
                <option value="adm05">ADMINISTRADOR</option>
                <option value="aux01">AUXILIAR</option>
                <option value="enf02">ENFERMERO</option>
                <option value="med03">MÉDICO</option>
                <option value="ter04">TERAPIA</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Correo:</label>
              <input
                className="shadow-inner appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Contrasena:</label>
              <input
                className="shadow-inner appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="password"
                name="contrasena"
                value={formData.contrasena}
                onChange={handleInputChange}
                required={!editingUserId}
                placeholder={editingUserId ? 'Dejar en blanco para no cambiar' : ''}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline transition-colors"
              type="submit"
            >
              {editingUserId ? 'Actualizar' : 'Crear'} Usuario
            </button>
            {editingUserId && (
              <button
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline transition-colors"
                type="button"
                onClick={() => {
                  setEditingUserId(null);
                  resetForm();
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="mt-8">
        {/* Buscador rapido entre formulario y lista */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="font-medium mr-2">Buscar:</label>
            <select value={searchField} onChange={(e) => setSearchField(e.target.value)} className="p-2 border rounded">
              <option value="all">Todos</option>
              <option value="name">Nombre</option>
              <option value="id">Id</option>
              <option value="rol">Rol</option>
              <option value="correo">Correo</option>
              <option value="usuario">Usuario</option>
            </select>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Texto de busqueda..." className="ml-2 p-2 border rounded w-64" />
            <button onClick={() => { /* buscar ya hace filtro en cliente; si quieres server-side aquí puedes llamar API */ }} className="ml-2 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600">Buscar</button>
            <button onClick={() => { setSearch(''); setSearchField('all'); }} className="ml-2 bg-gray-200 px-3 py-2 rounded hover:bg-gray-300">Limpiar</button>
          </div>
          <div className="text-sm text-gray-600">Filtra la lista de usuarios por id, nombre, rol o correo.</div>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-4">Lista de Usuarios</h2>
        <div className="bg-white p-8 rounded-xl shadow-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Id Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users
                .filter((user) => {
                  if (!search || search.trim() === '') return true;
                  const q = search.toLowerCase();
                  const fullName = `${user.primerNombre || ''} ${user.segundoNombre || ''} ${user.primerApellido || ''} ${user.segundoApellido || ''}`.toLowerCase();
                  switch (searchField) {
                    case 'name':
                      return fullName.includes(q);
                    case 'id':
                      return String(user.idUsuario || '').includes(q);
                    case 'rol':
                      return (String(user.rol?.rol || user.idRol || '')).toLowerCase().includes(q);
                    case 'correo':
                      return (user.correo || '').toLowerCase().includes(q);
                    case 'usuario':
                      return (String(user.idUsuario || '').includes(q) || (user.correo || '').toLowerCase().includes(q));
                    case 'all':
                    default:
                      return (
                        fullName.includes(q) ||
                        (user.correo || '').toLowerCase().includes(q) ||
                        String(user.idUsuario || '').includes(q) ||
                        String(user.rol?.rol || user.idRol || '').toLowerCase().includes(q)
                      );
                  }
                })
                .map((u) => (
                <tr key={u.idUsuario}>
                  <td className="px-6 py-4 whitespace-nowrap">{u.idUsuario}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{u.primerNombre} {u.segundoNombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{u.primerApellido} {u.segundoApellido}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{u.rol ? u.rol.rol : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{u.correo}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleEditUser(u)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded-full transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.idUsuario)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-full transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Componente del dashboard (pagina principal despues del login)
const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home'); // Estado para controlar la pestana activa

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
              <h2 className="text-3xl font-medium text-gray-800 mb-4">Bienvenido, {user?.primerNombre}</h2>
              <p className="text-lg text-gray-600">Este es tu panel de control de administrador.</p>
            </div>
            <PersonalMalla user={user} />
          </div>
        );
      case 'users':
        return <UserManagement />;
      case 'turns':
        return <TurnosModule />;
      case 'news':
        return (
          <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Gestion de Novedades</h2>
            <p className="text-lg text-gray-600 mt-4">Proximamente se implementara la gestion de novedades.</p>
          </div>
        );
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
          <img src="https://i.ibb.co/L5hYh8C/logo.png" alt="Logo" className="w-12 h-12 mr-3"/>
          <h2 className="text-2xl font-bold">SGTurnos</h2>
        </div>
        <nav className="flex-grow">
          <ul>
            <li>
              <button
                onClick={() => setActiveTab('home')}
                className={`w-full text-left py-3 px-4 rounded-xl font-semibold transition-colors duration-200 mb-2 ${activeTab === 'home' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700'}`}
              >
                Inicio
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full text-left py-3 px-4 rounded-xl font-semibold transition-colors duration-200 mb-2 ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700'}`}
              >
                Gestion de Usuarios
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('turns')}
                className={`w-full text-left py-3 px-4 rounded-xl font-semibold transition-colors duration-200 mb-2 ${activeTab === 'turns' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700'}`}
              >
                Gestion de Turnos
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('news')}
                className={`w-full text-left py-3 px-4 rounded-xl font-semibold transition-colors duration-200 mb-2 ${activeTab === 'news' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700'}`}
              >
                Gestion de Novedades
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('other')}
                className={`w-full text-left py-3 px-4 rounded-xl font-semibold transition-colors duration-200 mb-2 ${activeTab === 'other' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700'}`}
              >
                Otros Modulos
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
      <App />
    </Router>
  );
}
