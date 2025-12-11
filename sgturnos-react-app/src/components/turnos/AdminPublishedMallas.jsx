import React, { useState, useEffect } from 'react';
import { exportGridToExcel, exportGridToPdf } from '../../utils/exportUtils';
import TurnosGrid from './TurnosGrid';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const AdminPublishedMallas = () => {
  const month = new Date().toISOString().slice(0, 7);

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

  // Mapeo de roles a nombres amigables
  const roleNames = {
    med03: 'Médico',
    aux01: 'Auxiliar',
    enf02: 'Enfermero',
    ter04: 'Terapeuta'
  };

  const roleIds = Object.keys(roleNames);

  // Cargar malla oficial para un rol específico
  const loadPublishedMalla = async (roleId) => {
    if (loading[roleId]) return;

    setLoading(prev => ({ ...prev, [roleId]: true }));

    try {
      const res = await fetch(`/api/mallas/published?roleId=${encodeURIComponent(roleId)}&month=${encodeURIComponent(month)}`);
      
      if (!res.ok) {
        setMallaData(prev => ({ ...prev, [roleId]: [] }));
        setLoading(prev => ({ ...prev, [roleId]: false }));
        return;
      }

      const json = await res.json();
      if (json && json.preview) {
        setMallaData(prev => ({ ...prev, [roleId]: json.preview || [] }));
      } else {
        setMallaData(prev => ({ ...prev, [roleId]: [] }));
      }
    } catch (e) {
      console.warn('Error loading published malla for role', roleId, e);
      setMallaData(prev => ({ ...prev, [roleId]: [] }));
    } finally {
      setLoading(prev => ({ ...prev, [roleId]: false }));
    }
  };

  // Cargar todas las mallas al montar el componente
  useEffect(() => {
    roleIds.forEach(roleId => {
      loadPublishedMalla(roleId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  // Detectar si hay columnas de días
  const hasDayColumns = (malla) => {
    return Array.isArray(malla) && malla.length > 0 && 
           malla.some(row => Object.keys(row || {}).some(k => /^d\d+$/.test(k)));
  };

  // Exportar a Excel
  const handleExportExcel = (roleId, roleName) => {
    const malla = mallaData[roleId];
    if (!malla || malla.length === 0) {
      alert('No hay datos para exportar');
      return;
    }
    exportGridToExcel(malla, `Malla_${roleName}_${month}.xlsx`, {
      excludeColumns: ['id'],
      excludeRowMarkers: ['EQUITY_STATS', 'SUMMARY'],
      excludeRowIds: [-1]
    });
  };

  // Exportar a PDF
  const handleExportPdf = (roleId, roleName) => {
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

    exportGridToPdf(containerId, `Malla_${roleName}_${month}.pdf`, {
      orientation: 'landscape',
      margin: 10
    });
  };

  // Generar PDF para vista previa en modal
  const handleViewPdfModal = async (roleId, roleName) => {
    const malla = mallaData[roleId];
    if (!malla || malla.length === 0) {
      alert('No hay datos para visualizar');
      return;
    }

    setPdfModal(prev => ({ ...prev, isGenerating: true }));

    try {
      const containerId = `malla-grid-${roleId}`;
      const elem = document.getElementById(containerId);
      if (!elem) {
        alert('No se pudo encontrar la tabla para generar PDF');
        setPdfModal(prev => ({ ...prev, isGenerating: false }));
        return;
      }

      // Crear copia del elemento para no afectar el original
      const clonedElem = elem.cloneNode(true);
      clonedElem.style.position = 'absolute';
      clonedElem.style.left = '-9999px';
      clonedElem.style.width = elem.scrollWidth + 'px';
      document.body.appendChild(clonedElem);

      // Convertir a canvas
      const canvas = await html2canvas(clonedElem, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scale: 1
      });

      // Limpiar clon
      document.body.removeChild(clonedElem);

      // Crear PDF
      const A4_WIDTH = 297;
      const A4_HEIGHT = 210;
      const imgWidth = A4_WIDTH - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF('l', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      let heightLeft = imgHeight;
      let position = 0;

      while (heightLeft >= 0) {
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= A4_HEIGHT - 20;
        position -= A4_HEIGHT - 20;

        if (heightLeft > 0) {
          pdf.addPage();
        }
      }

      // Convertir PDF a blob y crear URL
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      setPdfModal({
        isOpen: true,
        pdfUrl,
        roleName,
        isGenerating: false
      });
    } catch (error) {
      console.error('Error generating PDF preview:', error);
      alert('Error al generar la vista previa del PDF');
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

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Mallas Oficiales Publicadas</h2>
        <p className="text-gray-600 mb-6">Mes: <span className="font-semibold">{month}</span></p>
      </div>

      {/* Grid de mallas */}
      <div className="grid grid-cols-1 gap-8">
        {roleIds.map((roleId) => (
          <div key={roleId} className="bg-white rounded-xl shadow-lg overflow-hidden">
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
                      <TurnosGrid malla={mallaData[roleId]} />
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
                      Exportar XLSX
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
                      Descargar PDF
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500 text-lg">
                    No hay malla oficial publicada para {roleNames[roleId].toLowerCase()} en {month}
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
                Malla de {pdfModal.roleName} - {month}
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
    </div>
  );
};

export default AdminPublishedMallas;
