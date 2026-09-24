// ============================================
// LISTAS-VIEW - Vista "Listas por curso"
// Asistencia 3D - Logos Academy
// Depende de js/listas.js (window.LISTAS_CURSOS).
// Se carga ANTES de app.js; switchTab() llama a renderListas().
// ============================================

// SheetJS se carga bajo demanda al exportar (CDN). Si no carga en ~5 s,
// se exporta CSV con extensión .xls (Excel lo abre directamente).
// No se incluye como <script> estático para no bloquear la carga de la
// app si la red del colegio no alcanza el CDN.
const XLSX_CDN = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';

// Escapa texto antes de insertarlo en el DOM (los datos vienen de un
// archivo generado, pero es barato blindarlo).
function escListas(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function listasContainer() {
  return document.getElementById('listasContent');
}

// --- Renderizado de la vista ---
function renderListas() {
  const container = listasContainer();
  if (!container) return;
  if (!window.LISTAS_CURSOS) {
    container.innerHTML =
      '<div class="empty-state"><span class="icon">&#9888;</span>' +
      '<p>No se encontraron las listas de cursos (LISTAS_CURSOS).</p></div>';
    return;
  }

  let html = '';
  for (const [key, curso] of Object.entries(window.LISTAS_CURSOS)) {
    const total = curso.students.length;
    const sinCorreo = curso.students.filter(function (s) { return !s.email; }).length;
    const badge = total + ' estudiantes' + (sinCorreo ? ' · ' + sinCorreo + ' sin correo' : '');

    html +=
      '<div class="lista-curso" style="border-left-color:' + escListas(curso.color) + '">' +
      '<div class="lista-curso-head">' +
      '<h3 class="lista-curso-title" style="color:' + escListas(curso.color) + '">' +
      escListas(curso.label) +
      '<span class="lista-count">' + escListas(badge) + '</span></h3>' +
      '<button class="btn-export lista-export" type="button" ' +
      'onclick="exportListasExcel(\'' + escListas(key) + '\')">' +
      '<span aria-hidden="true">&#128193;</span> Exportar Excel</button>' +
      '</div>' +
      '<div class="table-wrap">' +
      '<table class="report-table">' +
      '<thead><tr><th class="th-num">#</th><th class="th-name">Nombre</th>' +
      '<th>Correo institucional</th></tr></thead>' +
      '<tbody>';

    for (const s of curso.students) {
      const correo = s.email
        ? '<span class="email-cell">' + escListas(s.email) + '</span>'
        : '<span class="sin-correo" title="No disponible">—</span>';
      html +=
        '<tr><td class="num">' + escListas(s.num) + '</td>' +
        '<td class="name-cell">' + escListas(s.name) + '</td>' +
        '<td>' + correo + '</td></tr>';
    }

    html += '</tbody></table></div></div>';
  }
  container.innerHTML = html;
}

// --- Exportación a Excel ---

// Arma las filas {Paralelo, Nombre, Correo}. scope = 'global' o clave de curso.
function buildListasRows(scope) {
  const rows = [];
  if (!window.LISTAS_CURSOS) return rows;
  const cursos = scope === 'global'
    ? Object.entries(window.LISTAS_CURSOS)
    : (window.LISTAS_CURSOS[scope] ? [[scope, window.LISTAS_CURSOS[scope]]] : []);
  for (const [, curso] of cursos) {
    for (const s of curso.students) {
      rows.push({ Paralelo: curso.label, Nombre: s.name, Correo: s.email || '' });
    }
  }
  return rows;
}

function listasFilename(scope) {
  if (scope === 'global') return 'Listas_por_curso_2026-2027';
  const curso = window.LISTAS_CURSOS && window.LISTAS_CURSOS[scope];
  return (curso ? curso.label.replace(/\s+/g, '_') : scope) + '_2026-2027';
}

function listasStatus(msg) {
  const el = document.getElementById('listasExportStatus');
  if (!el) return;
  el.textContent = msg;
  clearTimeout(listasStatus._t);
  if (msg) {
    listasStatus._t = setTimeout(function () { el.textContent = ''; }, 6000);
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function () {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

// Fallback: CSV con BOM UTF-8 y extensión .xls (Excel lo abre sin pasos extra).
function exportListasCSV(rows, filename) {
  const lines = [['Paralelo', 'Nombre', 'Correo']];
  for (const r of rows) lines.push([r.Paralelo, r.Nombre, r.Correo]);
  const csv = lines.map(function (line) {
    return line.map(function (cell) {
      const v = String(cell == null ? '' : cell);
      return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    }).join(',');
  }).join('\r\n');
  downloadBlob(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }), filename + '.xls');
}

function exportListasXLSX(rows, filename) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Listas');
  XLSX.writeFile(wb, filename + '.xlsx');
}

// Carga SheetJS desde el CDN con timeout. Resuelve solo si window.XLSX existe.
function loadSheetJS(timeoutMs) {
  return new Promise(function (resolve, reject) {
    if (window.XLSX) { resolve(); return; }
    const s = document.createElement('script');
    s.src = XLSX_CDN;
    s.onload = function () {
      if (window.XLSX) resolve(); else reject(new Error('XLSX no disponible'));
    };
    s.onerror = function () { reject(new Error('CDN no disponible')); };
    document.head.appendChild(s);
    setTimeout(function () {
      if (!window.XLSX) reject(new Error('Tiempo de carga agotado'));
    }, timeoutMs || 5000);
  });
}

// Punto de entrada de los botones. scope = 'global' o clave de curso.
function exportListasExcel(scope) {
  const rows = buildListasRows(scope);
  if (!rows.length) {
    listasStatus('No hay datos para exportar.');
    return;
  }
  const filename = listasFilename(scope);
  if (window.XLSX) {
    exportListasXLSX(rows, filename);
    listasStatus('Archivo Excel descargado.');
    return;
  }
  listasStatus('Cargando librería de Excel…');
  loadSheetJS(5000)
    .then(function () {
      exportListasXLSX(rows, filename);
      listasStatus('Archivo Excel descargado.');
    })
    .catch(function () {
      exportListasCSV(rows, filename);
      listasStatus('Librería no disponible: se descargó CSV compatible con Excel.');
    });
}