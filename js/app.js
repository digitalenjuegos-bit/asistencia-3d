// ============================================
// ASISTENCIA 3D - App Principal
// Logos Academy
// ============================================

// --- Estado ---
let state = {
  tab: 'asistencia',
  course: '',
  date: '',
  marks: {},
  hasRecord: false
};

let reportData = [];
let reportCourse = '';
let reportStudent = '';
let reportFrom = '';
let reportTo = '';

const MARK_LABELS = { P: 'Presente', F: 'Falta', A: 'Atraso', J: 'Justificado', N: 'Pendiente' };
const MARK_COLORS = { P: '#00b894', F: '#d63031', A: '#fdcb6e', J: '#6c5ce7', N: '#9ca3af' };

// --- Persistencia ---
// Si Firebase está configurado, guarda en RTDB. Si no, usa localStorage.
const LS_KEY = 'asistencia_3d_local';

// --- Helpers de normalización de marcas (Firebase RTDB) ---
function normalizeMarks(marks) {
  const out = {};
  if (!marks) return out;
  if (Array.isArray(marks)) {
    for (let i = 0; i < marks.length; i++) {
      if (marks[i] !== null && marks[i] !== undefined) out[i] = marks[i];
    }
    return out;
  }
  for (const [k, v] of Object.entries(marks)) {
    if (v === null || v === undefined) continue;
    let num = k;
    if (typeof k === 'string' && k.charAt(0) === 's') num = k.substring(1);
    const n = parseInt(num);
    if (!isNaN(n)) out[n] = v;
  }
  return out;
}

function denormalizeMarks(marks) {
  const out = [];
  if (!marks) return out;
  let maxNum = 0;
  for (const [k, v] of Object.entries(marks)) {
    const n = parseInt(k);
    if (!isNaN(n) && n > maxNum) maxNum = n;
  }
  for (let i = 0; i <= maxNum; i++) {
    out[i] = marks[i] || null;
  }
  return out;
}

// --- Utilidades DOM ---
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar Firebase ANTES de cualquier uso de la base de datos.
  // Sin initializeApp, window.firebase.database() lanza un error síncrono
  // ("No Firebase App '[DEFAULT]' has been created") que rompe loadAttendance()
  // y deja la lista de estudiantes vacía.
  if (window.FIREBASE_CONFIGURED && window.firebase && !window.firebase.apps.length) {
    window.firebase.initializeApp(window.FIREBASE_CONFIG);
  }
  configurarNavegacion();
  poblarCursos();
  poblarReportes();
  initTilt3D();
  initPrintHeader();
  console.log('Asistencia 3D inicializada OK');
});

// --- Efecto tilt 3D sobre tarjetas ---
function initTilt3D() {
  $$('.card-3d').forEach(card => {
    // Tarjetas con data-no-tilt no se inclinan (evita mareo en listas largas)
    if (card.hasAttribute('data-no-tilt')) return;
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 25;
      const rotateY = (centerX - x) / 25;
      card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
      card.style.setProperty('--mouse-x', ((x / rect.width) * 100) + '%');
      card.style.setProperty('--mouse-y', ((y / rect.height) * 100) + '%');
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  });
}

// --- Membrete institucional para el PDF (hoja membretada) ---
// Envuelve las vistas en una tabla cuyo thead se repite en cada página al
// imprimir (display:table-header-group en @media print). El thead tiene tres
// celdas: logotipo a la izquierda, título centrado y fecha de generación a la
// derecha. En pantalla la tabla no genera caja (display:contents en styles.css),
// así el layout visual no cambia y no hace falta tocar index.html.
function initPrintHeader() {
  if (document.querySelector('.print-layout')) return;
  const views = document.querySelector('.views');
  if (!views) return;

  const table = document.createElement('table');
  table.className = 'print-layout';
  table.innerHTML =
    '<thead><tr>' +
    '<td class="print-header-cell print-cell-left">' +
    '<img src="img/logo-logos-academy.png" alt="Logotipo Logos Academy" class="print-logo">' +
    '</td>' +
    '<td class="print-header-cell print-cell-center">' +
    '<span class="print-doc">Reporte de Asistencia 2026-2027</span>' +
    '</td>' +
    '<td class="print-header-cell print-cell-right">' +
    '<span class="print-date"></span>' +
    '</td>' +
    '</tr></thead>' +
    '<tbody><tr><td class="print-body-cell" colspan="3"></td></tr></tbody>';

  views.parentNode.insertBefore(table, views);
  table.querySelector('.print-body-cell').appendChild(views);
  updatePrintDate();
}

// Fecha de generación del reporte en el membrete (hora local del navegador,
// Ecuador GMT-5). Se actualiza al cargar y de nuevo justo antes de imprimir.
function updatePrintDate() {
  const el = document.querySelector('.print-date');
  if (!el) return;
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  el.textContent = 'Generado el ' + dd + '/' + mm + '/' + yyyy;
}

// --- Navegación ---
function configurarNavegacion() {
  $$('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function switchTab(tab) {
  state.tab = tab;
  $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + tab));
  if (tab === 'reportes') initReports();
}

// --- Poblar selectores de curso ---
function poblarCursos() {
  const sel = $('#courseSelect');
  if (!sel) return;
  sel.innerHTML = '<option value="">-- Seleccionar curso --</option>';
  for (const [key, c] of Object.entries(COURSES)) {
    sel.innerHTML += '<option value="' + key + '">' + c.label + ' (' + c.students.length + ')</option>';
  }
}

function poblarReportes() {
  const sel = $('#reportCourse');
  if (!sel) return;
  sel.innerHTML = '<option value="">-- Seleccionar curso --</option>';
  for (const [key, c] of Object.entries(COURSES)) {
    sel.innerHTML += '<option value="' + key + '">' + c.label + ' (' + c.students.length + ')</option>';
  }
}

// --- Cambio de curso ---
function onCourseChange() {
  state.course = $('#courseSelect').value;
  state.marks = {};
  state.hasRecord = false;
  if (!state.course) {
    $('#studentList').innerHTML = '<div class="empty-state"><div class="icon">&#128203;</div><p>Selecciona un curso para comenzar</p></div>';
    $('#infoBar').textContent = '';
    return;
  }
  const today = new Date().toISOString().split('T')[0];
  $('#dateSelect').value = today;
  loadAttendance();
}

// --- Cambio de fecha (sin resetear el curso ni forzar la fecha de hoy) ---
function onDateChange() {
  if (!state.course) return;
  state.marks = {};
  state.hasRecord = false;
  loadAttendance();
}

// --- Cargar asistencia para curso+fecha ---
function loadAttendance() {
  const course = state.course;
  const date = $('#dateSelect').value;
  if (!course || !date) return;
  state.date = date;

  const courseData = COURSES[course];
  const studentList = $('#studentList');
  studentList.innerHTML = '';

  // Cargar marcas guardadas
  loadMarks(course, date).then(marks => {
    state.marks = marks || {};
    state.hasRecord = Object.keys(state.marks).length > 0;
    renderStudentList(courseData, state.marks);
    updateInfoBar(courseData);
  });
}

// --- Cargar marcas (Firebase o localStorage) ---
function loadMarks(course, date) {
  return new Promise((resolve) => {
    if (window.FIREBASE_CONFIGURED && window.firebase) {
      const db = window.firebase.database();
      db.ref(FB_PATH + '/' + course + '/' + date).once('value').then(snap => {
        resolve(normalizeMarks(snap.val()));
      }).catch(() => resolve(null));
    } else {
      // Modo local
      try {
        const raw = localStorage.getItem(LS_KEY);
        const data = raw ? JSON.parse(raw) : {};
        const courseData = data[course] || {};
        resolve(normalizeMarks(courseData[date]));
      } catch (e) {
        resolve(null);
      }
    }
  });
}

// --- Render lista de estudiantes ---
function renderStudentList(courseData, marks) {
  const studentList = $('#studentList');
  studentList.innerHTML = '';

  courseData.students.forEach(st => {
    const current = marks[st.num] || null;
    const row = document.createElement('div');
    row.className = 'student-row';
    row.innerHTML = `
      <div class="student-num">${st.num}</div>
      <div class="student-name">${st.name}</div>
      <div class="mark-buttons">
        ${mkBtn('P', current)}
        ${mkBtn('F', current)}
        ${mkBtn('A', current)}
        ${mkBtn('J', current)}
        ${mkBtn('N', current)}
      </div>
    `;
    row.querySelectorAll('.mark-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mark = btn.dataset.mark;
        const num = st.num;
        if (state.marks[num] === mark) {
          delete state.marks[num];
        } else {
          state.marks[num] = mark;
        }
        renderStudentList(courseData, state.marks);
        updateInfoBar(courseData);
      });
    });
    studentList.appendChild(row);
  });
}

function mkBtn(mark, current) {
  const active = mark === current ? 'active' : '';
  return `<button class="mark-btn ${active}" data-mark="${mark}" title="${MARK_LABELS[mark]}">${mark}</button>`;
}

function updateInfoBar(courseData) {
  const total = courseData.students.length;
  const marked = Object.keys(state.marks).length;
  const presentes = Object.values(state.marks).filter(m => m === 'P').length;
  const info = $('#infoBar');
  if (info) {
    info.textContent = `Marcados: ${marked}/${total} | Presentes: ${presentes}`;
  }
}

// --- Marcar todos presentes ---
function markAllPresent() {
  const course = state.course;
  if (!course) return;
  const courseData = COURSES[course];
  courseData.students.forEach(st => {
    state.marks[st.num] = 'P';
  });
  renderStudentList(courseData, state.marks);
  updateInfoBar(courseData);
}

// --- Guardar asistencia ---
function saveAttendance() {
  const course = state.course;
  const date = $('#dateSelect').value;
  if (!course || !date) {
    showToast('Selecciona curso y fecha');
    return;
  }

  const normalized = normalizeMarks(state.marks);

  if (window.FIREBASE_CONFIGURED && window.firebase) {
    const db = window.firebase.database();
    db.ref(FB_PATH + '/' + course + '/' + date).set(normalized).then(() => {
      showToast('Asistencia guardada en la nube');
    }).catch(err => {
      showToast('Error al guardar: ' + err.message);
    });
  } else {
    // Modo local
    try {
      const raw = localStorage.getItem(LS_KEY);
      const data = raw ? JSON.parse(raw) : {};
      if (!data[course]) data[course] = {};
      data[course][date] = normalized;
      localStorage.setItem(LS_KEY, JSON.stringify(data));
      showToast('Asistencia guardada (local)');
    } catch (e) {
      showToast('Error al guardar localmente');
    }
  }
}

// --- Reportes ---
function initReports() {
  const courseSel = $('#reportCourse');
  if (courseSel && courseSel.options.length <= 1) {
    poblarReportes();
  }
}

function onReportCourseChange() {
  reportCourse = $('#reportCourse').value;
  const studentSel = $('#reportStudent');
  studentSel.innerHTML = '<option value="">-- Todos los estudiantes --</option>';
  if (reportCourse && COURSES[reportCourse]) {
    COURSES[reportCourse].students.forEach(st => {
      studentSel.innerHTML += '<option value="' + st.num + '">' + st.name + '</option>';
    });
  }
  loadReport();
}

function onReportStudentChange() {
  reportStudent = $('#reportStudent').value;
  loadReport();
}

function onReportDateChange() {
  reportFrom = $('#reportDateFrom').value;
  reportTo = $('#reportDateTo').value;
  loadReport();
}

// --- Cargar todos los datos de un curso para el reporte ---
function loadCourseData(course) {
  return new Promise((resolve) => {
    if (window.FIREBASE_CONFIGURED && window.firebase) {
      const db = window.firebase.database();
      db.ref(FB_PATH + '/' + course).once('value').then(snap => {
        const val = snap.val() || {};
        const dates = Object.keys(val).sort();
        const records = dates.map(d => ({ date: d, marks: normalizeMarks(val[d]) }));
        resolve(records);
      }).catch(() => resolve([]));
    } else {
      try {
        const raw = localStorage.getItem(LS_KEY);
        const data = raw ? JSON.parse(raw) : {};
        const courseData = data[course] || {};
        const dates = Object.keys(courseData).sort();
        const records = dates.map(d => ({ date: d, marks: normalizeMarks(courseData[d]) }));
        resolve(records);
      } catch (e) {
        resolve([]);
      }
    }
  });
}

// --- Cargar y renderizar reporte ---
async function loadReport() {
  const content = $('#reportContent');
  if (!reportCourse) {
    content.innerHTML = '<div class="empty-state"><p>Selecciona un curso para ver el reporte</p></div>';
    return;
  }

  const records = await loadCourseData(reportCourse);
  if (records.length === 0) {
    content.innerHTML = '<div class="empty-state"><p>No hay datos de asistencia para este curso</p></div>';
    return;
  }

  // Filtrar por rango de fechas
  let filtered = records;
  if (reportFrom) filtered = filtered.filter(r => r.date >= reportFrom);
  if (reportTo) filtered = filtered.filter(r => r.date <= reportTo);

  if (filtered.length === 0) {
    content.innerHTML = '<div class="empty-state"><p>No hay datos en el rango de fechas seleccionado</p></div>';
    return;
  }

  reportData = filtered;
  renderReport(filtered);
}

// --- Render reporte ---
function renderReport(records) {
  const content = $('#reportContent');
  const courseData = COURSES[reportCourse];

  // Estudiantes a mostrar (filtro por estudiante si aplica)
  let students = courseData.students;
  if (reportStudent) {
    students = students.filter(st => String(st.num) === String(reportStudent));
  }

  // Resumen: por curso completo o por estudiante filtrado
  let summary = { P: 0, F: 0, A: 0, J: 0, N: 0, total: 0 };
  if (reportStudent) {
    summary = computeStudentStats(parseInt(reportStudent), records);
  } else {
    records.forEach(r => {
      Object.values(r.marks).forEach(m => {
        if (summary[m] !== undefined) summary[m]++;
        // J (Justificado) y N (Pendiente) NO cuentan en el total de asistencia
        if (m !== 'N' && m !== 'J') summary.total++;
      });
    });
  }

  const pct = summary.total > 0 ? Math.round((summary.P / summary.total) * 100) : 0;

  let html = '';

  // Tarjetas de resumen
  html += '<div class="report-summary">';
  html += `<div class="summary-card"><div class="summary-value">${pct}%</div><div class="summary-label">Asistencia general</div></div>`;
  html += `<div class="summary-card"><div class="summary-value" style="color:${MARK_COLORS.P}">${summary.P}</div><div class="summary-label">Presentes</div></div>`;
  html += `<div class="summary-card"><div class="summary-value" style="color:${MARK_COLORS.F}">${summary.F}</div><div class="summary-label">Faltas</div></div>`;
  html += `<div class="summary-card"><div class="summary-value" style="color:${MARK_COLORS.A}">${summary.A}</div><div class="summary-label">Atrasos</div></div>`;
  html += `<div class="summary-card"><div class="summary-value" style="color:${MARK_COLORS.J}">${summary.J}</div><div class="summary-label">Justificados</div></div>`;
  html += `<div class="summary-card"><div class="summary-value" style="color:${MARK_COLORS.N}">${summary.N}</div><div class="summary-label">Pendientes</div></div>`;
  html += '</div>';

  // Gráfico de barras por tipo de marca
  html += '<div class="chart-section"><h3>Distribución por tipo de marca</h3>';
  html += renderBarChart(summary);
  html += '</div>';

  // Tabla por estudiante
  html += '<div class="chart-section"><h3>Asistencia por estudiante</h3>';
  html += '<div class="table-wrap"><table class="report-table"><thead><tr>';
  html += '<th>#</th><th>Estudiante</th><th>Presentes</th><th>Faltas</th><th>Atrasos</th><th>Justif.</th><th>Pend.</th><th>% Asist.</th>';
  html += '</tr></thead><tbody>';

  students.forEach(st => {
    const stats = computeStudentStats(st.num, records);
    const rowPct = stats.total > 0 ? Math.round((stats.P / stats.total) * 100) : 0;
    html += `<tr>`;
    html += `<td>${st.num}</td>`;
    html += `<td class="student-cell">${st.name}</td>`;
    html += `<td>${stats.P}</td>`;
    html += `<td>${stats.F}</td>`;
    html += `<td>${stats.A}</td>`;
    html += `<td>${stats.J}</td>`;
    html += `<td>${stats.N}</td>`;
    html += `<td><span class="pct-badge" style="background:${pctColor(rowPct)}">${rowPct}%</span></td>`;
    html += `</tr>`;
  });

  html += '</tbody></table></div></div>';

  // Detalle de asistencia por fecha (solo cuando hay estudiante filtrado)
  if (reportStudent) {
    const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const num = parseInt(reportStudent, 10);
    html += '<div class="chart-section"><h3>Detalle de asistencia por fecha</h3>';
    html += '<div class="table-wrap"><table class="report-table"><thead><tr><th>Fecha</th><th>Marca</th></tr></thead><tbody>';
    records.forEach(r => {
      const parts = r.date.split('-');
      const fecha = `${parseInt(parts[2], 10)} ${MESES[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
      const m = r.marks[num];
      if (m && MARK_LABELS[m]) {
        html += `<tr><td>${fecha}</td><td style="color:${MARK_COLORS[m]}">${MARK_LABELS[m]}</td></tr>`;
      } else {
        html += `<tr><td>${fecha}</td><td style="color:#999">Sin registro</td></tr>`;
      }
    });
    html += '</tbody></table></div></div>';
  }

  content.innerHTML = html;
}

// --- Calcular estadísticas de un estudiante ---
function computeStudentStats(num, records) {
  const stats = { P: 0, F: 0, A: 0, J: 0, N: 0, total: 0 };
  records.forEach(r => {
    const m = r.marks[num];
    if (m && stats[m] !== undefined) {
      stats[m]++;
      // Las marcas N (Pendiente) y J (Justificado) NO cuentan en el total de asistencia
      if (m !== 'N' && m !== 'J') stats.total++;
    }
  });
  return stats;
}

// --- Color según porcentaje ---
function pctColor(pct) {
  if (pct >= 90) return '#00b894';
  if (pct >= 75) return '#fdcb6e';
  return '#d63031';
}

// --- Gráfico de barras (CSS puro) ---
function renderBarChart(summary) {
  const max = Math.max(summary.P, summary.F, summary.A, summary.J, summary.N, 1);
  const types = [
    { key: 'P', label: 'Presentes', color: MARK_COLORS.P },
    { key: 'F', label: 'Faltas', color: MARK_COLORS.F },
    { key: 'A', label: 'Atrasos', color: MARK_COLORS.A },
    { key: 'J', label: 'Justif.', color: MARK_COLORS.J },
    { key: 'N', label: 'Pend.', color: MARK_COLORS.N }
  ];

  let html = '<div class="bar-chart">';
  types.forEach(t => {
    const h = Math.round((summary[t.key] / max) * 100);
    html += `<div class="bar-col">`;
    html += `<div class="bar-value">${summary[t.key]}</div>`;
    html += `<div class="bar" style="height:${h}%;background:${t.color}"></div>`;
    html += `<div class="bar-label">${t.label}</div>`;
    html += `</div>`;
  });
  html += '</div>';
  return html;
}

// --- Exportar CSV ---
function exportCSV() {
  if (!reportCourse || reportData.length === 0) {
    showToast('No hay datos para exportar');
    return;
  }
  const courseData = COURSES[reportCourse];
  let csv = 'Numero,Estudiante,Presentes,Faltas,Atrasos,Justificados,Pendientes,Porcentaje_Asistencia\n';
  courseData.students.forEach(st => {
    const stats = computeStudentStats(st.num, reportData);
    const pct = stats.total > 0 ? Math.round((stats.P / stats.total) * 100) : 0;
    csv += `${st.num},"${st.name}",${stats.P},${stats.F},${stats.A},${stats.J},${stats.N},${pct}%\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'asistencia_' + reportCourse + '.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('CSV exportado');
}

// --- Exportar PDF (impresión) ---
function exportPDF() {
  if (!reportCourse || reportData.length === 0) {
    showToast('No hay datos para exportar');
    return;
  }
  updatePrintDate();
  window.print();
}

// --- Toast ---
function showToast(msg) {
  let toast = $('#toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// --- Exponer funciones globales para el HTML ---
window.onCourseChange = onCourseChange;
window.onDateChange = onDateChange;
window.onReportCourseChange = onReportCourseChange;
window.onReportStudentChange = onReportStudentChange;
window.onReportDateChange = onReportDateChange;
window.markAllPresent = markAllPresent;
window.saveAttendance = saveAttendance;
window.exportCSV = exportCSV;
window.exportPDF = exportPDF;
