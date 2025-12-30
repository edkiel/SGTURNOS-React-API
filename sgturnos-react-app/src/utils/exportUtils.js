import * as XLSX from 'xlsx';
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

// Exporta un grid (array de objetos) a Excel con estilos básicos: encabezados centrados,
// rellenos pastel en encabezado y filas alternadas, bordes y anchos de columna.
export function exportGridToExcel(gridData, filename = 'malla.xlsx', options = {}) {
  // allow table-based export even if gridData is empty/null
  if ((!gridData || gridData.length === 0) && !(options && options.tableId)) return null;

  // Si se especifica `tableId` en opciones, usar la tabla DOM para generar el Excel
  if (options.tableId && typeof document !== 'undefined') {
    const container = document.getElementById(options.tableId);
    if (container) {
      try {
        const tables = container.querySelectorAll('table');
        const workbook = XLSX.utils.book_new();

        if (!tables || tables.length === 0) {
          // nothing to export
          return null;
        }

        const exclude = Array.isArray(options.excludeColumns) ? options.excludeColumns.map(s => (s||'').trim().toLowerCase()) : [];
        const excludeSet = new Set(exclude);
        const excludeRowMarkers = Array.isArray(options.excludeRowMarkers) ? options.excludeRowMarkers.map(s => (s||'').trim().toLowerCase()) : ['equity_stats','summary'];
        const excludeRowMarkersSet = new Set(excludeRowMarkers);
        const excludeIdSet = new Set(Array.isArray(options.excludeRowIds) ? options.excludeRowIds.map(Number) : [-2, -1]);

        // Si hay múltiples tablas, crear una hoja por tabla (Semana 1, Semana 2...)
        if (tables.length > 1) {
          tables.forEach((t, idx) => {
            try {
              // first remove unwanted rows, then remove unwanted columns
              const withoutRows = excludeRowMarkersSet.size > 0 || excludeIdSet.size > 0 ? removeRowsFromTableElement(t, excludeRowMarkersSet, excludeIdSet) : t;
              const tableToUse = excludeSet.size > 0 ? removeColumnsFromTableElement(withoutRows, excludeSet) : withoutRows;
              const ws = XLSX.utils.table_to_sheet(tableToUse, { raw: false });
              const sheetName = options.sheetName || `Semana ${idx + 1}`;
              XLSX.utils.book_append_sheet(workbook, ws, sheetName);
            } catch (err) {
              console.warn('No se pudo convertir una tabla a hoja:', err);
            }
          });
        } else {
          const withoutRows = excludeRowMarkersSet.size > 0 || excludeIdSet.size > 0 ? removeRowsFromTableElement(tables[0], excludeRowMarkersSet, excludeIdSet) : tables[0];
          const tableToUse = excludeSet.size > 0 ? removeColumnsFromTableElement(withoutRows, excludeSet) : withoutRows;
          const ws = XLSX.utils.table_to_sheet(tableToUse, { raw: false });
          XLSX.utils.book_append_sheet(workbook, ws, options.sheetName || 'Malla');
        }

        if (options.returnBlob) {
          const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          return new Blob([wbout], { type: 'application/octet-stream' });
        }
        XLSX.writeFile(workbook, filename);
        return null;
      } catch (err) {
        console.error('Error exportando tabla(s) a XLSX', err);
      }
    }
  }

  // Usar SheetJS (xlsx) como implementación por defecto para evitar dependencias nativas.
  try {
    // aplicar filtro de columnas si está definido
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

    // aplicar filtro de filas (por marcadores textuales o ids negativos) si está definido
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
        // keep row unless it matches exclusion criteria
        if (excludeRowMarkersSet.has(firstLower) || excludeRowMarkersSet.has(secondLower)) return false;
        if (!Number.isNaN(maybeNum) && excludeIdSet.has(maybeNum)) return false;
        return true;
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToUse || []);
    const headers = Object.keys((dataToUse && dataToUse[0]) || {});
    worksheet['!cols'] = headers.map((h) => ({ wch: Math.max(10, h.length + 8) }));

    // Intento de estilo en encabezados (limitado por el soporte de SheetJS/viewers)
    const headerRowIndex = 0;
    headers.forEach((h, idx) => {
      const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: idx });
      const cell = worksheet[cellRef];
      if (cell) {
        cell.s = cell.s || {};
        cell.s.font = { bold: true };
        cell.s.alignment = { horizontal: 'center', vertical: 'center' };
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Malla');

    if (options.returnBlob) {
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      return new Blob([wbout], { type: 'application/octet-stream' });
    }

    XLSX.writeFile(workbook, filename);
    return null;
  } catch (e) {
    console.error('Error exportando a XLSX', e);
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

  // Aplicar estilo general al clone (contenedor)
  clone.style.background = '#ffffff';
  clone.style.padding = '12px';
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
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const marginX = options.marginX || 8; // mm
    const marginY = options.marginY || 8; // mm
    const usableWidth = pageWidth - marginX * 2;
    const usableHeight = pageHeight - marginY * 2;

    // Conversión mm -> CSS px (assume 96 DPI)
    const mmToCssPx = (mm) => Math.round((mm / 25.4) * 96);
    const targetCssWidth = mmToCssPx(usableWidth);
    clone.style.width = `${targetCssWidth}px`;
    clone.style.maxWidth = 'none';

    // Ajustes de presentación para impresión: usar tamaño de fuente más compacto por defecto
    const desiredFontSize = options.fontSize || '10px';
    clone.style.fontSize = desiredFontSize;

    // Reducir paddings en celdas para que el texto ocupe más espacio relativo
    const tablesLocal = clone.querySelectorAll('table');
    tablesLocal.forEach((table) => {
      table.style.fontSize = desiredFontSize;
      table.style.lineHeight = '1.05';
      const ths = table.querySelectorAll('th');
      ths.forEach((th) => {
        th.style.padding = '4px 6px';
      });
      const tds = table.querySelectorAll('td');
      tds.forEach((td) => {
        td.style.padding = '2px 4px';
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
