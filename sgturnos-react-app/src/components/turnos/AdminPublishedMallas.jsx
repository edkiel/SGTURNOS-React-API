import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { exportGridToExcel, exportGridToPdf } from '../../utils/exportUtils';
import TurnosGrid from './TurnosGrid';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Toast from '../common/Toast';

const AdminPublishedMallas = ({ user, roleName, isUsuarioRegular }) => {
  // Estado para el mes seleccionado (inicialmente mes actual)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  const [mallaData, setMallaData] = useState({
    med03: null,
    aux01: null,
    enf02: null,
    ter04: null
  });

  const [loading, setLoading] = useState({
    med03: false,
    aux01: false,
    enf02: false,
    ter04: false
  });

  // Estado para el modal de PDF
  const [pdfModal, setPdfModal] = useState({
    isOpen: false,
    pdfUrl: null,
    roleName: '',
    isGenerating: false
  });

  // Estado para toast notifications
  const [toastData, setToastData] = useState({ visible: false, message: '', type: 'success' });

  // Estado para confirmación de despublicación
  const [confirmUnpublish, setConfirmUnpublish] = useState(null);

  // Mapeo de roles a nombres amigables
  const roleNames = {
    med03: 'Médico',
    aux01: 'Auxiliar',
    enf02: 'Enfermero',
    ter04: 'Terapeuta'
  };

  // Obtener el ID del rol del usuario actual
  const userRoleId = user?.rol?.idRol || user?.rol?.id_rol || null;
  
  // Si es usuario regular (asistencial), solo mostrar su malla
  // Si es admin/jefe/operaciones/rrhh, mostrar todas las mallas
  const roleIds = isUsuarioRegular && userRoleId
    ? [userRoleId] // Solo el rol del usuario
    : Object.keys(roleNames); // Todas las mallas

  // Cargar malla oficial para un rol específico
  const loadPublishedMalla = async (roleId) => {
    if (loading[roleId]) return;

    setLoading(prev => ({ ...prev, [roleId]: true }));

    try {
      const res = await api.get(`/mallas/published?roleId=${encodeURIComponent(roleId)}&month=${encodeURIComponent(selectedMonth)}`);
      
      const json = res.data;
      if (json && json.preview) {
        setMallaData(prev => ({ ...prev, [roleId]: json.preview || [] }));
      } else {
        // Malla no publicada aún es normal, no mostrar error
        setMallaData(prev => ({ ...prev, [roleId]: [] }));
      }
    } catch (e) {
      // Capturar errores de red pero no mostrar alerta si la malla no existe
      if (e.response?.status !== 404) {
        console.error('Error loading published malla for role', roleId, e);
      }
      setMallaData(prev => ({ ...prev, [roleId]: [] }));
    } finally {
      setLoading(prev => ({ ...prev, [roleId]: false }));
    }
  };

  // Cargar todas las mallas al montar el componente o cuando cambie el mes seleccionado
  useEffect(() => {
    roleIds.forEach(roleId => {
      loadPublishedMalla(roleId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  // Detectar si hay columnas de días
  const hasDayColumns = (malla) => {
    return Array.isArray(malla) && malla.length > 0 && 
           malla.some(row => Object.keys(row || {}).some(k => /^d\d+$/.test(k)));
  };

  // Exportar a Excel
  const handleExportExcel = async (roleId, roleName) => {
    const malla = mallaData[roleId];
    if (!malla || malla.length === 0) {
      alert('No hay datos para exportar');
      return;
    }
    await exportGridToExcel(malla, `Malla_${roleName}_${selectedMonth}.xlsx`, {
      excludeColumns: ['id'],
      excludeRowMarkers: ['EQUITY_STATS', 'SUMMARY'],
      excludeRowIds: [-1]
    });
  };

  // Exportar a PDF
  const handleExportPdf = async (roleId, roleName) => {
    const malla = mallaData[roleId];
    if (!malla || malla.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const containerId = `malla-grid-${roleId}`;
    const elem = document.getElementById(containerId);
    if (!elem) {
      alert('No se pudo encontrar la tabla para exportar');
      return;
    }

    // Extraer mes y año del formato YYYY-MM
    const [year, monthNum] = selectedMonth.split('-');
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthName = monthNames[parseInt(monthNum) - 1];

    try {
      await exportGridToPdf(containerId, `Malla_${roleName}_${selectedMonth}.pdf`, {
        marginX: 10,
        marginY: 10,
        fontSize: '11px',
        canvasScale: 2,
        excludeRowMarkers: ['EQUITY_STATS', 'SUMMARY'],
        excludeRowIds: [-1, -2],
        headerInfo: {
          rolName: roleName,
          month: monthName,
          year: year
        }
      });
    } catch (error) {
      console.error('Error exportando PDF:', error);
      alert('Error al exportar PDF. Revisa la consola.');
    }
  };

  // Despublicar malla (quitar oficialidad)
  const handleUnpublishMalla = async (roleId, roleName) => {
    // Abrir modal de confirmación
    setConfirmUnpublish({ roleId, roleName });
  };

  // Confirmar despublicación
  const confirmUnpublishAction = async () => {
    if (!confirmUnpublish) return;
    const { roleId, roleName } = confirmUnpublish;

    try {
      await api.delete(`/mallas/unpublish?roleId=${encodeURIComponent(roleId)}&month=${encodeURIComponent(selectedMonth)}`);
      
      setToastData({ visible: true, message: `Malla de ${roleName} despublicada correctamente`, type: 'success' });
      
      // Limpiar los datos en el estado
      setMallaData(prev => ({ ...prev, [roleId]: null }));
      setConfirmUnpublish(null);
    } catch (error) {
      console.error('Error despublicando malla:', error);
      setToastData({ visible: true, message: 'Error al despublicar malla. Revisa la consola.', type: 'error' });
      setConfirmUnpublish(null);
    }
  };

  // Generar PDF para vista previa en modal
  const handleViewPdfModal = async (roleId, roleName) => {
    const malla = mallaData[roleId];
    if (!malla || malla.length === 0) {
      alert('No hay datos para visualizar');
      return;
    }

    setPdfModal(prev => ({ ...prev, isGenerating: true }));

    // Pequeño delay para asegurar que el DOM está completamente renderizado
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const containerId = `malla-grid-${roleId}`;
      const elem = document.getElementById(containerId);
      if (!elem) {
        alert('No se pudo encontrar la tabla para generar PDF');
        setPdfModal(prev => ({ ...prev, isGenerating: false }));
        return;
      }

      console.log('Generando PDF para:', roleId, 'Elemento encontrado:', elem);

      // Crear copia del elemento para no afectar el original
      const clonedElem = elem.cloneNode(true);
      clonedElem.style.position = 'absolute';
      clonedElem.style.left = '-9999px';
      clonedElem.style.top = '0';
      clonedElem.style.width = elem.scrollWidth + 'px';
      clonedElem.style.backgroundColor = '#ffffff';
      document.body.appendChild(clonedElem);

      // Esperar un momento para que el clon se renderice
      await new Promise(resolve => setTimeout(resolve, 300));

      // Convertir a canvas con mejor configuración
      const canvas = await html2canvas(clonedElem, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scale: 2, // Aumentar escala para mejor calidad
        logging: true, // Habilitar logs para debugging
        width: elem.scrollWidth,
        height: elem.scrollHeight,
        windowWidth: elem.scrollWidth,
        windowHeight: elem.scrollHeight
      });

      console.log('Canvas generado:', canvas.width, 'x', canvas.height);

      // Limpiar clon
      document.body.removeChild(clonedElem);

      // Validar que el canvas tiene contenido
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('El canvas generado está vacío');
      }

      // Crear PDF en orientación horizontal (landscape)
      const A4_WIDTH = 297; // mm
      const A4_HEIGHT = 210; // mm
      const margin = 10;
      const imgWidth = A4_WIDTH - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF('l', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png', 1.0);

      console.log('Dimensiones del PDF:', imgWidth, 'x', imgHeight);

      // Agregar título
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Malla de ${roleName} - ${selectedMonth}`, margin, margin + 5);

      let heightLeft = imgHeight;
      let position = margin + 10; // Dejar espacio para el título

      // Primera página
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= (A4_HEIGHT - position - margin);

      // Páginas adicionales si es necesario
      while (heightLeft > 0) {
        pdf.addPage();
        position = -(imgHeight - heightLeft) + margin;
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= (A4_HEIGHT - (margin * 2));
      }

      // Convertir PDF a blob y crear URL
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      console.log('PDF generado exitosamente, URL:', pdfUrl);

      setPdfModal({
        isOpen: true,
        pdfUrl,
        roleName,
        isGenerating: false
      });
    } catch (error) {
      console.error('Error generating PDF preview:', error);
      alert(`Error al generar la vista previa del PDF: ${error.message}`);
      setPdfModal(prev => ({ ...prev, isGenerating: false }));
    }
  };

  // Cerrar modal PDF
  const closePdfModal = () => {
    if (pdfModal.pdfUrl) {
      URL.revokeObjectURL(pdfModal.pdfUrl);
    }
    setPdfModal({
      isOpen: false,
      pdfUrl: null,
      roleName: '',
      isGenerating: false
    });
  };

  // Generar opciones de meses (mes actual y próximo mes)
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    // Mes actual
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentMonthValue = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    options.push({
      value: currentMonthValue,
      label: `${monthNames[currentMonth]} ${currentYear}`
    });
    
    // Próximo mes
    const nextDate = new Date(currentYear, currentMonth + 1, 1);
    const nextYear = nextDate.getFullYear();
    const nextMonth = nextDate.getMonth();
    const nextMonthValue = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}`;
    options.push({
      value: nextMonthValue,
      label: `${monthNames[nextMonth]} ${nextYear}`
    });
    
    return options;
  };

  const monthOptions = generateMonthOptions();

  return (
    <div className="w-full">
      <div className="w-full mb-4">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Mallas Oficiales Publicadas</h3>
            </div>
          </div>
          
          {/* Selector de mes */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Ver mallas de:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 font-semibold"
            >
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid de mallas */}
      <div className="w-full grid grid-cols-1 gap-4">
        {roleIds.map((roleId) => (
          <div key={roleId} className="bg-gray-50 rounded-xl shadow-md overflow-hidden border border-gray-200">
            {/* Header del rol */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <i className={`fas fa-${roleId === 'med03' ? 'stethoscope' : roleId === 'aux01' ? 'hand-holding-medical' : roleId === 'enf02' ? 'nurse' : 'heart'}`}></i>
                Malla de {roleNames[roleId]}
              </h3>
            </div>

            {/* Contenido de la malla */}
            <div className="p-6">
              {loading[roleId] ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">Cargando malla...</p>
                </div>
              ) : mallaData[roleId] && mallaData[roleId].length > 0 ? (
                <div>
                  {/* Grid de turnos */}
                  <div id={`malla-grid-${roleId}`} className="mb-6 overflow-x-auto">
                    {hasDayColumns(mallaData[roleId]) ? (
                      <TurnosGrid data={mallaData[roleId]} month={selectedMonth} />
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        Formato de malla no reconocido
                      </p>
                    )}
                  </div>

                  {/* Botones de exportación */}
                  <div className="flex gap-3 flex-wrap justify-end">
                    <button
                      onClick={() => handleExportExcel(roleId, roleNames[roleId])}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-file-excel"></i>
                      Excel
                    </button>
                    <button
                      onClick={() => handleViewPdfModal(roleId, roleNames[roleId])}
                      disabled={pdfModal.isGenerating}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <i className="fas fa-file-pdf"></i>
                      {pdfModal.isGenerating ? 'Generando...' : 'Ver PDF'}
                    </button>
                    <button
                      onClick={() => handleExportPdf(roleId, roleNames[roleId])}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-download"></i>
                      PDF
                    </button>
                    {/* Botón Despublicar: solo visible para usuarios administrativos */}
                    {!isUsuarioRegular && (
                      <button
                        onClick={() => handleUnpublishMalla(roleId, roleNames[roleId])}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-ban"></i>
                        Despublicar
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500 text-lg">
                    No hay malla oficial publicada para {roleNames[roleId].toLowerCase()} en {selectedMonth}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal para vista previa de PDF */}
      {pdfModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800">
                Malla de {pdfModal.roleName} - {selectedMonth}
              </h3>
              <button
                onClick={closePdfModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Contenedor del PDF */}
            <div className="flex-1 overflow-auto p-6 bg-gray-100">
              {pdfModal.pdfUrl ? (
                <iframe
                  src={pdfModal.pdfUrl}
                  title="PDF Preview"
                  className="w-full h-full border border-gray-300 rounded-lg"
                  style={{ minHeight: '600px' }}
                />
              ) : (
                <div className="flex items-center justify-center h-96">
                  <p className="text-gray-500 text-lg">Generando PDF...</p>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
              <button
                onClick={closePdfModal}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      <Toast
        message={toastData.message}
        type={toastData.type}
        isVisible={toastData.visible}
        onClose={() => setToastData({ ...toastData, visible: false })}
        centered={true}
      />

      {/* Modal de confirmación de despublicación */}
      {confirmUnpublish && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-fadeIn">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">¿Despublicar Malla?</h3>
            <p className="text-center text-gray-600 mb-6">
              ¿Estás seguro de despublicar la malla de <span className="font-semibold text-gray-900">{confirmUnpublish.roleName}</span>?
              <br />
              <span className="text-sm text-orange-600 mt-2 block">Los usuarios asistenciales ya no podrán verla.</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmUnpublish(null)}
                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmUnpublishAction}
                className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors"
              >
                Despublicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPublishedMallas;
