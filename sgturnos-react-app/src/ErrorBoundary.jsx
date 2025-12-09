import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    // also log to console for dev
    console.error('ErrorBoundary caught', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
            <h2 className="text-xl font-bold mb-2">Se ha producido un error en la aplicación</h2>
            <p className="mb-4 text-sm text-gray-700">Copia el mensaje de error para ayudar a diagnosticar el problema.</p>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto" style={{maxHeight: '40vh'}}>{String(this.state.error && this.state.error.toString()) + (this.state.info && this.state.info.componentStack ? '\n\n' + this.state.info.componentStack : '')}</pre>
            <div className="mt-4 flex gap-2">
              <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={() => window.location.reload()}>Recargar</button>
              <button className="bg-red-600 text-white px-3 py-2 rounded" onClick={() => { localStorage.clear(); window.location.reload(); }}>Borrar sesión y recargar</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
