import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Helper: elimina columnas de una tabla clonada según nombres (comparación en minúsculas)
function removeColumnsFromTableElement(tableEl, excludeLowerSet) {
  const clone = tableEl.cloneNode(true);
  const headerRow = clone.querySelector('thead tr') || clone.querySelector('tr');
  if (!headerRow) return clone;
  const headerCells = Array.from(headerRow.children);
  const removeIdx = [];
  headerCells.forEach((cell, i) => {
    const txt = (cell.textContent || '').trim().toLowerCase();
    if (excludeLowerSet.has(txt)) removeIdx.push(i);
  });
  if (removeIdx.length === 0) return clone;
  const rows = clone.querySelectorAll('tr');
  rows.forEach((row) => {
    const cells = Array.from(row.children);
    for (let j = removeIdx.length - 1; j >= 0; j--) {
      const idx = removeIdx[j];
      if (cells[idx]) row.removeChild(cells[idx]);
    }
  });
  return clone;
}

// Helper: elimina filas cuyo primer celda coincide con ciertos marcadores (ej. '-2 EQUITY_STATS' o '-1 SUMMARY')
function removeRowsFromTableElement(tableEl, excludeFirstCellLowerSet, excludeIdSet) {
  const clone = tableEl.cloneNode(true);
  const rows = Array.from(clone.querySelectorAll('tr'));
  rows.forEach((tr) => {
    const firstCell = tr.children && tr.children[0] ? tr.children[0].textContent.trim() : '';
    const secondCell = tr.children && tr.children[1] ? tr.children[1].textContent.trim() : '';
    const firstLower = (firstCell || '').toLowerCase();
    const secondLower = (secondCell || '').toLowerCase();
    // remove when either the whole first cell matches text marker, or when first cell numeric (-1/-2) and second cell matches marker
    const maybeNum = parseInt(firstCell, 10);
    if (excludeFirstCellLowerSet.has(firstLower) || (excludeIdSet.has(maybeNum) && excludeFirstCellLowerSet.has(secondLower))) {
      tr.parentNode && tr.parentNode.removeChild(tr);
      return;
    }
  });
  return clone;
}

// Exporta un grid (array de objetos) a Excel con estilos profesionales usando ExcelJS
export async function exportGridToExcel(gridData, filename = 'malla.xlsx', options = {}) {
  if ((!gridData || gridData.length === 0) && !(options && options.tableId)) return null;

  try {
    // Filtrar columnas si es necesario
    let dataToUse = gridData || [];
    if (Array.isArray(options.excludeColumns) && options.excludeColumns.length > 0) {
      const excludeSet = new Set(options.excludeColumns.map(s => (s||'').trim().toLowerCase()));
      dataToUse = (gridData || []).map(row => {
        const out = {};
        Object.keys(row || {}).forEach((k) => {
          if (!excludeSet.has(k.trim().toLowerCase())) out[k] = row[k];
        });
        return out;
      });
    }

    // Filtrar filas si es necesario
    const excludeRowMarkers = Array.isArray(options.excludeRowMarkers) ? options.excludeRowMarkers.map(s => (s||'').trim().toLowerCase()) : ['equity_stats','summary'];
    const excludeRowMarkersSet = new Set(excludeRowMarkers);
    const excludeIdSet = new Set(Array.isArray(options.excludeRowIds) ? options.excludeRowIds.map(Number) : [-2, -1]);
    if (excludeRowMarkersSet.size > 0 || excludeIdSet.size > 0) {
      dataToUse = (dataToUse || []).filter((row) => {
        const keys = Object.keys(row || {});
        const firstVal = keys.length > 0 ? row[keys[0]] : '';
        const secondVal = keys.length > 1 ? row[keys[1]] : '';
        const firstLower = String(firstVal || '').trim().toLowerCase();
        const secondLower = String(secondVal || '').trim().toLowerCase();
        const maybeNum = parseInt(String(firstVal || ''), 10);
        if (excludeRowMarkersSet.has(firstLower) || excludeRowMarkersSet.has(secondLower)) return false;
        if (!Number.isNaN(maybeNum) && excludeIdSet.has(maybeNum)) return false;
        return true;
      });
    }

    // Crear workbook con ExcelJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(options.sheetName || 'Malla');

    if (!dataToUse || dataToUse.length === 0) {
      return null;
    }

    const headers = Object.keys(dataToUse[0] || {});

    // Agregar encabezados
    const headerRow = worksheet.addRow(headers);

    // Aplicar estilos a encabezados
    headerRow.eachCell((cell, colNumber) => {
      cell.value = headers[colNumber - 1];
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2F5496' } // Azul profesional
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' }, // Blanco
        size: 12
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'center',
        wrapText: true
      };
      cell.border = {
        left: { style: 'thin', color: { argb: 'FF4472C4' } },
        right: { style: 'thin', color: { argb: 'FF4472C4' } },
        top: { style: 'thin', color: { argb: 'FF4472C4' } },
        bottom: { style: 'thin', color: { argb: 'FF4472C4' } }
      };
    });

    // Establecer altura de encabezado
    headerRow.height = 28;

    // Agregar filas de datos
    dataToUse.forEach((rowData, rowIndex) => {
      const row = worksheet.addRow(headers.map(h => rowData[h]));
      
      const isAlternate = rowIndex % 2 === 1;
      const bgColor = isAlternate ? 'FFF0F0F0' : 'FFFFFFFF'; // Gris claro o blanco

      row.eachCell((cell) => {
        cell.alignment = {
          horizontal: 'center',
          vertical: 'center'
        };
        cell.border = {
          left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } }
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: bgColor }
        };
      });
    });

    // Configurar ancho de columnas
    worksheet.columns = headers.map((h) => ({
      header: h,
      key: h,
      width: Math.max(14, h.length + 2)
    }));

    // Generar buffer y descargar
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    
    // Crear descarga
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return null;
  } catch (e) {
    console.error('Error exportando a Excel con ExcelJS', e);
    return null;
  }
}

// Exporta un elemento HTML (tabla o grid) a PDF con presentación mejorada.
// Se clona el elemento, se aplican estilos inline (centrado, paddings, colores pastel, bordes)
// y se captura con html2canvas para generar un PDF agradable.
export async function exportGridToPdf(elementId, filename = 'malla.pdf', options = {}) {
  const el = document.getElementById(elementId);
  if (!el) return;

  // Colores y estilos configurables
  const headerBg = options.headerBgColor || '#cfe2f3';
  const rowAltBg = options.rowAltBgColor || '#f7f7f7';
  const fontFamily = options.fontFamily || 'Arial, Helvetica, sans-serif';

  // Clonar para no alterar el DOM visible
  const clone = el.cloneNode(true);

  // Agregar encabezado con información de la malla si se proporciona
  if (options.headerInfo) {
    const headerDiv = document.createElement('div');
    headerDiv.style.marginBottom = '10px';
    headerDiv.style.fontWeight = 'bold';
    headerDiv.style.fontSize = '11px';
    headerDiv.style.textAlign = 'center';
    headerDiv.style.lineHeight = '1.5';
    headerDiv.style.color = '#333';
    
    let headerHTML = '';
    if (options.headerInfo.rolName) {
      headerHTML += `Rol: ${options.headerInfo.rolName}<br>`;
    }
    if (options.headerInfo.month) {
      headerHTML += `Mes: ${options.headerInfo.month}<br>`;
    }
    if (options.headerInfo.year) {
      headerHTML += `Año: ${options.headerInfo.year}`;
    }
    
    headerDiv.innerHTML = headerHTML;
    clone.insertBefore(headerDiv, clone.firstChild);
  }

  // remove unwanted rows early (so both PDF and XLSX omit them)
  const excludeRowMarkers = Array.isArray(options.excludeRowMarkers) ? options.excludeRowMarkers.map(s => (s||'').trim().toLowerCase()) : ['equity_stats','summary'];
  const excludeRowMarkersSet = new Set(excludeRowMarkers);
  const excludeIdSet = new Set(Array.isArray(options.excludeRowIds) ? options.excludeRowIds.map(Number) : [-2, -1]);
  if (excludeRowMarkersSet.size > 0 || excludeIdSet.size > 0) {
    const tablesForRemoval = Array.from(clone.querySelectorAll('table'));
    tablesForRemoval.forEach((t) => {
      try {
        const cleaned = removeRowsFromTableElement(t, excludeRowMarkersSet, excludeIdSet);
        if (cleaned && cleaned !== t && t.parentNode) t.parentNode.replaceChild(cleaned, t);
      } catch (e) {
        // continue even if a table can't be processed
        console.warn('removeRowsFromTableElement failed for PDF table', e);
      }
    });
  }

  // Aplicar estilo general al clone (contenedor) - maximizar espacio para nombres
  clone.style.background = '#ffffff';
  clone.style.padding = '3px';
  clone.style.boxSizing = 'border-box';
  clone.style.fontFamily = fontFamily;
  clone.style.color = '#222';

  // Buscar tabla(s) dentro del clone y aplicar estilos a th/td
  const tables = clone.querySelectorAll('table');
  tables.forEach((table) => {
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.margin = '0 auto';
    table.style.fontSize = '10px';

    const ths = table.querySelectorAll('th');
    ths.forEach((th) => {
      th.style.background = headerBg;
      th.style.padding = '10px 12px';
      th.style.textAlign = 'center';
      th.style.fontWeight = '700';
      th.style.border = '1px solid #d9d9d9';
    });

    const trs = table.querySelectorAll('tbody tr');
    trs.forEach((tr, idx) => {
      const isAlt = idx % 2 === 0;
      if (isAlt) tr.style.background = rowAltBg;
      const tds = tr.querySelectorAll('td');
      tds.forEach((td) => {
        td.style.padding = '8px 10px';
        td.style.textAlign = 'center';
        td.style.border = '1px solid #eee';
      });
    });

    // Si no existe thead, intentar estilizar primera fila como encabezado
    if (table.querySelectorAll('th').length === 0) {
      const firstRow = table.querySelector('tr');
      if (firstRow) {
        firstRow.style.background = headerBg;
        firstRow.style.fontWeight = '700';
        firstRow.style.textAlign = 'center';
        firstRow.querySelectorAll('td').forEach((td) => {
          td.style.padding = '10px 12px';
          td.style.border = '1px solid #d9d9d9';
        });
      }
    }
  });

  // Insertar clone fuera de la pantalla para renderizar
  clone.style.position = 'fixed';
  clone.style.left = '-10000px';
  clone.style.top = '0';
  document.body.appendChild(clone);

  try {
    // Calcular dimensiones PDF y convertir mm->px para darle al clone un ancho CSS
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const marginX = options.marginX || 3; // mm - mínimo para garantizar que quepa todo
    const marginY = options.marginY || 3; // mm - mínimo para garantizar que quepa todo
    const usableWidth = pageWidth - marginX * 2;
    const usableHeight = pageHeight - marginY * 2;

    // Conversión mm -> CSS px (assume 96 DPI)
    const mmToCssPx = (mm) => Math.round((mm / 25.4) * 96);
    const targetCssWidth = mmToCssPx(usableWidth);
    clone.style.width = `${targetCssWidth}px`;
    clone.style.maxWidth = 'none';

    // Ajustes de presentación para impresión: fuente clara y legible
    const desiredFontSize = options.fontSize || '9px';
    clone.style.fontSize = desiredFontSize;

    // Optimizar paddings en celdas - balance entre legibilidad y fit en página
    const tablesLocal = clone.querySelectorAll('table');
    tablesLocal.forEach((table) => {
      table.style.fontSize = desiredFontSize;
      table.style.lineHeight = '1.55';
      table.style.borderCollapse = 'collapse';
      const ths = table.querySelectorAll('th');
      ths.forEach((th) => {
        th.style.padding = '4px 3px';
        th.style.fontSize = desiredFontSize;
        th.style.fontWeight = 'bold';
        th.style.textAlign = 'center';
        th.style.verticalAlign = 'top';
        th.style.height = 'auto';
        th.style.margin = '0';
      });
      const tds = table.querySelectorAll('td');
      tds.forEach((td) => {
        td.style.padding = '3px 2px';
        td.style.fontSize = desiredFontSize;
        td.style.wordWrap = 'break-word';
        td.style.overflow = 'visible';
        td.style.textAlign = 'center';
        td.style.verticalAlign = 'top';
        td.style.height = 'auto';
        td.style.display = 'table-cell';
        td.style.margin = '0';
      });
    });

    const canvas = await html2canvas(clone, { scale: options.canvasScale || 2, useCORS: true, backgroundColor: '#ffffff' });

    const imgData = canvas.toDataURL('image/png');

    // Preparamos recortes desde el canvas original para crear páginas múltiples si hace falta.
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // altura en píxeles que corresponde a una página PDF tras escalar la anchura al usableWidth
    const sliceHeightPx = Math.floor((usableHeight * canvasWidth) / usableWidth);
    let yOffset = 0;
    let pageIndex = 0;

    while (yOffset < canvasHeight) {
      const remaining = canvasHeight - yOffset;
      const thisSliceH = Math.min(sliceHeightPx, remaining);

      // Crear canvas temporal con la porción a insertar
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = canvasWidth;
      tmpCanvas.height = thisSliceH;
      const tctx = tmpCanvas.getContext('2d');
      tctx.drawImage(canvas, 0, yOffset, canvasWidth, thisSliceH, 0, 0, canvasWidth, thisSliceH);

      const sliceData = tmpCanvas.toDataURL('image/png');

      // calcular altura en mm al escalar imagen a usableWidth
      const sliceHeightMm = (thisSliceH * usableWidth) / canvasWidth;

      // centrar verticalmente la slice si es menor que el usableHeight
      const yPosMm = marginY + Math.max(0, (usableHeight - sliceHeightMm) / 2);

      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(sliceData, 'PNG', marginX, yPosMm, usableWidth, sliceHeightMm);

      yOffset += thisSliceH;
      pageIndex++;
    }

    if (options.returnBlob) {
      return pdf.output('blob');
    }
    pdf.save(filename);
  } finally {
    // limpiar clone
    document.body.removeChild(clone);
  }
}

// Nota: la conversión de colores para Excel se gestiona localmente (se usan ARGB sin '#').
