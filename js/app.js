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

// Última escritura pendiente de persistencia. El reporte espera a que
// termine antes de recargar, para no leer datos viejos (carrera de lectura).
let pendingPersist = Promise.resolve();

// Evento beforeinstallprompt retenido para el banner de instalación PWA.
let deferredPrompt = null;

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
  restoreLastCourse();
  updateStorageBadge();
  initInstallBanner();
  initServiceWorker();
  initEditModal();
  checkBackupReminder();
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
// celdas: logotipo a la izquierda, título centrado y, a la derecha, el nombre
// del estudiante filtrado y la fecha de generación. En pantalla la tabla no
// genera caja (display:contents en styles.css),
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
    '<span class="print-student"></span>' +
    '<span class="print-date"></span>' +
    '</td>' +
    '</tr></thead>' +
    '<tbody><tr><td class="print-body-cell" colspan="3"></td></tr></tbody>';

  views.parentNode.insertBefore(table, views);
  table.querySelector('.print-body-cell').appendChild(views);
  updatePrintDate();
  updatePrintStudent();
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
  el.textContent = 'Fecha del reporte: ' + dd + '/' + mm + '/' + yyyy;
}

// Nombre del estudiante filtrado en el membrete. Si no hay estudiante
// seleccionado (filtro "Todos"), se indica "Estudiante: Todos". Se actualiza
// al cargar y de nuevo justo antes de imprimir, porque el filtro puede cambiar.
function updatePrintStudent() {
  const el = document.querySelector('.print-student');
  if (!el) return;
  const sel = $('#reportStudent');
  let name = 'Todos';
  if (sel && sel.selectedIndex >= 0) {
    const opt = sel.options[sel.selectedIndex];
    if (opt && opt.value) name = opt.textContent.trim();
  }
  el.textContent = 'Estudiante: ' + name;
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
  if (tab === 'reportes') {
    initReports();
    // Recargar el reporte con datos frescos cada vez que se entra a la
    // pestaña, esperando a que termine cualquier escritura pendiente.
    // Sin esto, el reporte muestra el snapshot viejo del render anterior.
    if (reportCourse) {
      pendingPersist.then(() => loadReport());
    }
  }
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

// --- Restaurar la última selección de curso (localStorage) ---
function restoreLastCourse() {
  let last = '';
  try { last = localStorage.getItem('asistencia_3d_lastCourse') || ''; } catch (e) { return; }
  if (!last || !COURSES[last]) return;

  // Vista Asistencia
  const sel = $('#courseSelect');
  if (sel) sel.value = last;
  state.course = last;
  const today = new Date().toISOString().split('T')[0];
  $('#dateSelect').value = today;
  loadAttendance();

  // Vista Reportes (mismo curso; el reporte se carga al entrar a la pestaña)
  const rSel = $('#reportCourse');
  if (rSel) {
    rSel.value = last;
    reportCourse = last;
    const studentSel = $('#reportStudent');
    if (studentSel) {
      studentSel.innerHTML = '<option value="">-- Todos los estudiantes --</option>';
      COURSES[last].students.forEach(st => {
        studentSel.innerHTML += '<option value="' + st.num + '">' + st.name + '</option>';
      });
    }
  }
}

// --- Indicador de modo de persistencia (honesto y dinámico) ---
// Lee FIREBASE_CONFIGURED y, si es true, verifica la conexión real con una
// lectura a la RTDB (con timeout). Tres estados: nube, local o sin conexión.
function updateStorageBadge() {
  const el = $('#storageBadge');
  if (!el) return;
  const setBadge = (text, cls) => {
    el.textContent = text;
    el.className = 'storage-badge ' + cls;
  };
  if (!window.FIREBASE_CONFIGURED || !window.firebase) {
    setBadge('Modo local', 'local');
    return;
  }
  const db = window.firebase.database();
  const timeout = new Promise(res => setTimeout(() => res('timeout'), 5000));
  Promise.race([
    db.ref(FB_PATH).once('value').then(() => 'ok'),
    timeout
  ]).then(r => {
    if (r === 'ok') setBadge('Conectado a la nube', 'cloud');
    else setBadge('Sin conexión a la nube', 'offline');
  }).catch(() => setBadge('Sin conexión a la nube', 'offline'));
}

// --- Banner de instalación PWA ---
// beforeinstallprompt solo se dispara en Chromium (Android/desktop).
// En iOS Safari no existe: el banner simplemente nunca se muestra y la app
// se instala desde "Añadir a pantalla de inicio" (meta tags apple-*).
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const banner = $('#installBanner');
  if (banner) banner.hidden = false;
});

window.addEventListener('appinstalled', () => {
  const banner = $('#installBanner');
  if (banner) banner.hidden = true;
  deferredPrompt = null;
  showToast('App instalada correctamente');
});

function initInstallBanner() {
  const installBtn = $('#installBtn');
  const dismissBtn = $('#installDismissBtn');
  if (installBtn) installBtn.addEventListener('click', installApp);
  if (dismissBtn) dismissBtn.addEventListener('click', dismissInstallBanner);
}

function installApp() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choice) => {
    if (choice.outcome === 'accepted') {
      showToast('App instalada correctamente');
    }
    deferredPrompt = null;
    const banner = $('#installBanner');
    if (banner) banner.hidden = true;
  }).catch(() => {
    deferredPrompt = null;
  });
}

function dismissInstallBanner() {
  const banner = $('#installBanner');
  if (banner) banner.hidden = true;
  deferredPrompt = null;
}

// --- Registro del Service Worker (PWA offline) ---
function initServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./sw.js').then((reg) => {
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      if (!newWorker) return;
      newWorker.addEventListener('statechange', () => {
        // Solo avisar cuando hay un SW previo (actualización), no en la
        // primera instalación: controller es null en el primer registro.
        if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
          showToast('Nueva versión disponible. Recarga la página para actualizar.');
        }
      });
    });
  }).catch((err) => {
    console.warn('Service Worker no registrado:', err);
  });
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
  try { localStorage.setItem('asistencia_3d_lastCourse', state.course); } catch (e) { /* almacenamiento no disponible */ }
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
    const delBtn = $('#deleteRecord');
    if (delBtn) delBtn.disabled = !state.hasRecord;
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
        // Persistir de inmediato: el reporte lee de Firebase/localStorage,
        // no de la memoria. Sin esto, desmarcar no se refleja en Reportes
        // si el usuario no pulsa el botón Guardar.
        pendingPersist = persistMarks(state.course, $('#dateSelect').value, state.marks)
          .catch(() => showToast('Error al guardar el cambio'));
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
    const pct = total > 0 ? Math.round((marked / total) * 100) : 0;
    // Rojo (poco avance) → amarillo → verde (completo)
    const color = pct >= 75 ? '#00b894' : pct >= 40 ? '#fdcb6e' : '#d63031';
    info.innerHTML =
      '<span class="info-text">Marcados: ' + marked + '/' + total + ' | Presentes: ' + presentes + '</span>' +
      '<div class="progress-track" role="progressbar" aria-valuenow="' + marked +
      '" aria-valuemin="0" aria-valuemax="' + total + '" aria-label="Progreso de marcado">' +
      '<div class="progress-fill" style="width:' + pct + '%;background:' + color + '"></div></div>';
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
  pendingPersist = persistMarks(course, $('#dateSelect').value, state.marks)
    .catch(() => showToast('Error al guardar el cambio'));
}

// --- Persistir marcas (Firebase o localStorage) ---
// Sin toast: lo usan el clic de marca y "Marcar todos" (persistencia
// automática) y también el botón Guardar (que añade su propio mensaje).
function persistMarks(course, date, marks) {
  // Punto de guardado real (lo llaman el clic de marca, "Marcar todos",
  // el botón Guardar y el modal de edición): cuenta para el recordatorio.
  bumpSaveCount();
  const normalized = normalizeMarks(marks);
  if (window.FIREBASE_CONFIGURED && window.firebase) {
    const db = window.firebase.database();
    return db.ref(FB_PATH + '/' + course + '/' + date).set(normalized);
  }
  // Modo local
  try {
    const raw = localStorage.getItem(LS_KEY);
    const data = raw ? JSON.parse(raw) : {};
    if (!data[course]) data[course] = {};
    data[course][date] = normalized;
    localStorage.setItem(LS_KEY, JSON.stringify(data));
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
}

// --- Guardar asistencia ---
function saveAttendance() {
  const course = state.course;
  const date = $('#dateSelect').value;
  if (!course || !date) {
    showToast('Selecciona curso y fecha');
    return;
  }
  if (Object.keys(state.marks).length === 0) {
    showToast('No has marcado ningún estudiante');
    return;
  }

  // Si ya existe un registro guardado para curso+fecha, pedir confirmación
  // antes de sobrescribir. La persistencia automática por clic (a633027) no
  // se toca: esta confirmación aplica solo al botón Guardar explícito.
  loadMarks(course, date).then(existing => {
    const hasExisting = existing && Object.keys(existing).length > 0;
    if (hasExisting) {
      showConfirmModal(
        'Ya existe un registro de asistencia para el ' + date + '. ¿Deseas sobrescribirlo?',
        () => doSaveAttendance(course, date)
      );
    } else {
      doSaveAttendance(course, date);
    }
  });
}

function doSaveAttendance(course, date) {
  pendingPersist = persistMarks(course, date, state.marks).then(() => {
    showToast(window.FIREBASE_CONFIGURED ? 'Asistencia guardada en la nube' : 'Asistencia guardada (local)');
  }).catch(err => {
    showToast('Error al guardar: ' + (err && err.message ? err.message : 'desconocido'));
  });
}

// --- Eliminar registro completo de una fecha ---
function deleteRecord() {
  const course = state.course;
  const date = $('#dateSelect').value;
  if (!course || !date) {
    showToast('Selecciona curso y fecha');
    return;
  }
  if (!state.hasRecord) {
    showToast('No hay registro guardado para esta fecha');
    return;
  }
  const courseLabel = COURSES[course] ? COURSES[course].label : course;
  showConfirmModal(
    'Se eliminará TODO el registro de asistencia del ' + date + ' de ' + courseLabel + '. Esta acción no se puede deshacer.',
    () => doDeleteRecord(course, date),
    'Eliminar'
  );
}

function doDeleteRecord(course, date) {
  const remove = (window.FIREBASE_CONFIGURED && window.firebase)
    ? window.firebase.database().ref(FB_PATH + '/' + course + '/' + date).remove()
    : Promise.resolve(removeLocalRecord(course, date));
  remove.then(() => {
    writeEditLog({ action: 'delete_record', course: course, date: date });
    state.marks = {};
    state.hasRecord = false;
    renderStudentList(COURSES[course], state.marks);
    updateInfoBar(COURSES[course]);
    const delBtn = $('#deleteRecord');
    if (delBtn) delBtn.disabled = true;
    showToast('Registro del ' + date + ' eliminado');
  }).catch(err => {
    showToast('Error al eliminar: ' + (err && err.message ? err.message : 'desconocido'));
  });
}

function removeLocalRecord(course, date) {
  const raw = localStorage.getItem(LS_KEY);
  const data = raw ? JSON.parse(raw) : {};
  if (data[course]) {
    delete data[course][date];
    // Limpiar curso vacío para no dejar nodos huérfanos
    if (Object.keys(data[course]).length === 0) delete data[course];
  }
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

// --- Modal de confirmación (sustituye a confirm() nativo, coherente con la estética) ---
// okLabel es opcional: permite cambiar el texto del botón de acción
// (p. ej. "Restaurar" o "Eliminar" en lugar de "Sobrescribir").
function showConfirmModal(msg, onConfirm, okLabel) {
  const overlay = $('#confirmModal');
  if (!overlay) return;
  const msgEl = $('#confirmModalMsg');
  const okBtn = $('#confirmOkBtn');
  const cancelBtn = $('#confirmCancelBtn');
  if (msgEl) msgEl.textContent = msg;
  if (okLabel) okBtn.textContent = okLabel;

  const cleanup = () => {
    overlay.hidden = true;
    if (okLabel) okBtn.textContent = 'Sobrescribir';
    okBtn.removeEventListener('click', handleOk);
    cancelBtn.removeEventListener('click', handleCancel);
    document.removeEventListener('keydown', handleKey);
    overlay.removeEventListener('click', handleOverlay);
  };
  const handleOk = () => { cleanup(); onConfirm(); };
  const handleCancel = () => { cleanup(); };
  const handleKey = (e) => { if (e.key === 'Escape') handleCancel(); };
  const handleOverlay = (e) => { if (e.target === overlay) handleCancel(); };

  okBtn.addEventListener('click', handleOk);
  cancelBtn.addEventListener('click', handleCancel);
  document.addEventListener('keydown', handleKey);
  overlay.addEventListener('click', handleOverlay);
  overlay.hidden = false;
  cancelBtn.focus();
}

// --- Edición de registros pasados (modal) ---
// Contexto del modal abierto: curso, fecha, estudiante y marca actual.
let editContext = null;

// Fecha ISO (YYYY-MM-DD) a formato legible "13 may 2026".
function formatDate(iso) {
  if (!iso) return '';
  const parts = iso.split('-');
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return parseInt(parts[2], 10) + ' ' + MESES[parseInt(parts[1], 10) - 1] + ' ' + parts[0];
}

function openEditModal(course, date, studentNum, studentName, currentMark) {
  editContext = {
    course: course,
    date: date,
    studentNum: studentNum,
    studentName: studentName,
    currentMark: currentMark || null
  };
  const info = $('#editModalInfo');
  if (info) info.textContent = studentName + ' — ' + formatDate(date);
  $$('#editMarks .mark-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mark === editContext.currentMark);
  });
  const overlay = $('#editModal');
  if (overlay) overlay.hidden = false;
  const saveBtn = $('#editSaveBtn');
  if (saveBtn) saveBtn.focus();
}

function selectEditMark(btn) {
  $$('#editMarks .mark-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function closeEditModal() {
  const overlay = $('#editModal');
  if (overlay) overlay.hidden = true;
  editContext = null;
}

function saveEditMark() {
  if (!editContext) return;
  const activeBtn = $('#editMarks .mark-btn.active');
  if (!activeBtn) {
    showToast('Selecciona una marca');
    return;
  }
  const ctx = editContext;
  const newMark = activeBtn.dataset.mark;
  if (newMark === ctx.currentMark) {
    closeEditModal();
    return;
  }
  // Reutiliza la capa de persistencia real: carga las marcas de esa fecha,
  // cambia la del estudiante y persiste con persistMarks (Firebase o local).
  loadMarks(ctx.course, ctx.date).then(marks => {
    const updated = marks || {};
    updated[ctx.studentNum] = newMark;
    pendingPersist = persistMarks(ctx.course, ctx.date, updated).then(() => {
      writeEditLog({
        course: ctx.course,
        date: ctx.date,
        student: ctx.studentNum,
        oldMark: ctx.currentMark,
        newMark: newMark
      });
      showToast('Asistencia actualizada');
      closeEditModal();
      if (state.tab === 'reportes') {
        loadReport();
      } else if (state.course === ctx.course && state.date === ctx.date) {
        loadAttendance();
      }
    }).catch(err => {
      showToast('Error al guardar: ' + (err && err.message ? err.message : 'desconocido'));
    });
  });
}

function initEditModal() {
  const saveBtn = $('#editSaveBtn');
  const cancelBtn = $('#editCancelBtn');
  const marksBox = $('#editMarks');
  if (saveBtn) saveBtn.addEventListener('click', saveEditMark);
  if (cancelBtn) cancelBtn.addEventListener('click', closeEditModal);
  if (marksBox) {
    marksBox.addEventListener('click', (e) => {
      const btn = e.target.closest('.mark-btn');
      if (btn) selectEditMark(btn);
    });
  }
  const overlay = $('#editModal');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeEditModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const ov = $('#editModal');
      if (ov && !ov.hidden) closeEditModal();
    }
  });
}

// --- Log de auditoría de cambios ---
// Se escribe al editar una marca (D1) y al eliminar un registro (F2).
// En modo nube va a Firebase (asistencia_3d/_editLog, push); en modo local
// a localStorage (asistencia_3d_editLog, array acotado a 500 entradas).
function writeEditLog(entry) {
  const logEntry = Object.assign({ editedAt: new Date().toISOString() }, entry);
  if (window.FIREBASE_CONFIGURED && window.firebase) {
    try {
      window.firebase.database().ref(FB_PATH + '/_editLog').push(logEntry);
    } catch (e) {
      console.warn('No se pudo escribir el log de auditoría', e);
    }
    return;
  }
  try {
    const raw = localStorage.getItem('asistencia_3d_editLog');
    const log = raw ? JSON.parse(raw) : [];
    log.push(logEntry);
    if (log.length > 500) log.splice(0, log.length - 500);
    localStorage.setItem('asistencia_3d_editLog', JSON.stringify(log));
  } catch (e) {
    console.warn('No se pudo escribir el log de auditoría', e);
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
  html += '<div class="table-wrap"><table class="report-table stats-table"><thead><tr>';
  html += '<th scope="col" class="th-num">#</th>';
  html += '<th scope="col" class="th-name">Estudiante</th>';
  html += '<th scope="col" class="th-num"><span class="th-code">P</span><span class="th-label">Presentes</span></th>';
  html += '<th scope="col" class="th-num"><span class="th-code">F</span><span class="th-label">Faltas</span></th>';
  html += '<th scope="col" class="th-num"><span class="th-code">A</span><span class="th-label">Atrasos</span></th>';
  html += '<th scope="col" class="th-num"><span class="th-code">J</span><span class="th-label">Justif.</span></th>';
  html += '<th scope="col" class="th-num"><span class="th-code">N</span><span class="th-label">Pend.</span></th>';
  html += '<th scope="col" class="th-num">Total</th>';
  html += '<th scope="col" class="th-num">% Asist.</th>';
  html += '<th scope="col" class="th-actions">Acciones</th>';
  html += '</tr></thead><tbody>';

  students.forEach(st => {
    const stats = computeStudentStats(st.num, records);
    const rowPct = stats.total > 0 ? Math.round((stats.P / stats.total) * 100) : 0;
    html += `<tr>`;
    html += `<td class="num">${st.num}</td>`;
    html += `<td class="name-cell">${st.name}</td>`;
    html += `<td class="num">${stats.P}</td>`;
    html += `<td class="num">${stats.F}</td>`;
    html += `<td class="num">${stats.A}</td>`;
    html += `<td class="num">${stats.J}</td>`;
    html += `<td class="num">${stats.N}</td>`;
    html += `<td class="num total-cell">${stats.total}</td>`;
    html += `<td class="num"><span class="pct-badge" style="background:${pctColor(rowPct)}">${rowPct}%</span></td>`;
    html += `<td class="num"><button class="edit-btn" data-student="${st.num}" data-name="${st.name}" title="Editar asistencia de ${st.name}" aria-label="Editar asistencia de ${st.name}">✏️</button></td>`;
    html += `</tr>`;
  });

  html += '</tbody>';

  // Fila de totales (tfoot): suma de columnas y % general, coherente con las
  // tarjetas de resumen. Solo cuando no hay filtro de estudiante (con filtro,
  // la fila única ya muestra esos mismos números y el total sería redundante).
  if (!reportStudent) {
    html += '<tfoot><tr>';
    html += '<td class="num"></td>';
    html += '<td class="tfoot-label">Total</td>';
    html += `<td class="num">${summary.P}</td>`;
    html += `<td class="num">${summary.F}</td>`;
    html += `<td class="num">${summary.A}</td>`;
    html += `<td class="num">${summary.J}</td>`;
    html += `<td class="num">${summary.N}</td>`;
    html += `<td class="num total-cell">${summary.total}</td>`;
    html += `<td class="num"><span class="pct-badge" style="background:${pctColor(pct)}">${pct}%</span></td>`;
    html += '<td class="num"></td>';
    html += '</tr></tfoot>';
  }

  html += '</table></div></div>';

  // Detalle de asistencia por fecha (solo cuando hay estudiante filtrado)
  if (reportStudent) {
    const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const num = parseInt(reportStudent, 10);
    html += '<div class="chart-section"><h3>Detalle de asistencia por fecha</h3>';
    html += '<div class="table-wrap"><table class="report-table detail-table"><thead><tr><th scope="col" class="th-num">#</th><th scope="col">Fecha</th><th scope="col">Marca</th></tr></thead><tbody>';
    records.forEach((r, i) => {
      const parts = r.date.split('-');
      const fecha = `${parseInt(parts[2], 10)} ${MESES[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
      const m = r.marks[num];
      if (m && MARK_LABELS[m]) {
        html += `<tr><td class="num">${i + 1}</td><td>${fecha}</td><td><button class="detail-mark-btn" data-date="${r.date}" data-mark="${m}" title="Editar marca del ${fecha}" aria-label="Editar marca del ${fecha}"><span class="mark-badge mark-${m}">${MARK_LABELS[m]}</span></button></td></tr>`;
      } else {
        html += `<tr><td class="num">${i + 1}</td><td>${fecha}</td><td><button class="detail-mark-btn" data-date="${r.date}" data-mark="" title="Registrar marca del ${fecha}" aria-label="Registrar marca del ${fecha}"><span class="mark-badge mark-none">Sin registro</span></button></td></tr>`;
      }
    });
    html += '</tbody></table></div></div>';
  }

  content.innerHTML = html;

  // Edición desde la tabla de estadísticas: la fila agrega varias fechas,
  // así que el modal abre con la fecha más reciente del rango filtrado.
  const lastRec = records.length ? records[records.length - 1] : null;
  content.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const num = btn.dataset.student;
      const name = btn.dataset.name;
      const current = lastRec ? (lastRec.marks[num] || null) : null;
      openEditModal(reportCourse, lastRec ? lastRec.date : '', num, name, current);
    });
  });

  // Edición desde el detalle por fecha: cada celda de marca abre el modal
  // con el estudiante filtrado y la fecha exacta de esa fila.
  content.querySelectorAll('.detail-mark-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const st = COURSES[reportCourse].students.find(s => String(s.num) === String(reportStudent));
      openEditModal(reportCourse, btn.dataset.date, reportStudent, st ? st.name : 'Estudiante', btn.dataset.mark || null);
    });
  });
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
  // Respetar el filtro de estudiante: si hay uno seleccionado, exportar solo sus datos
  let students = courseData.students;
  if (reportStudent) {
    students = students.filter(st => String(st.num) === String(reportStudent));
  }
  let csv = 'Numero,Estudiante,Presentes,Faltas,Atrasos,Justificados,Pendientes,Porcentaje_Asistencia\n';
  students.forEach(st => {
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
  updatePrintStudent();
  window.print();
}

// --- Respaldo y restauración de datos (JSON) ---
// Lee los datos locales (estructura real: una sola clave LS_KEY con
// { curso: { fecha: marcas } }).
function readLocalData() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

// Exporta TODOS los datos: nodo completo de Firebase o localStorage.
// Estructura: { _meta: {...}, data: {...} }.
function exportJSON() {
  const btn = $('#exportJSON');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Exportando…';
  }
  const gather = (window.FIREBASE_CONFIGURED && window.firebase)
    ? window.firebase.database().ref(FB_PATH).once('value').then(snap => snap.val() || {})
    : Promise.resolve(readLocalData());

  gather.then(data => {
    const courses = Object.keys(data).filter(k => !k.startsWith('_'));
    const backup = {
      _meta: {
        app: 'Asistencia 3D',
        exportDate: new Date().toISOString(),
        source: (window.FIREBASE_CONFIGURED && window.firebase) ? 'firebase' : 'local',
        totalCourses: courses.length,
        courses: courses
      },
      data: data
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = 'asistencia_3d_backup_' + today + '.json';
    a.click();
    URL.revokeObjectURL(url);
    try {
      localStorage.setItem('asistencia_3d_lastBackup', String(Date.now()));
      localStorage.setItem('asistencia_3d_saveCount', '0');
    } catch (e) { /* almacenamiento no disponible */ }
    showToast('Respaldo descargado correctamente');
  }).catch(err => {
    showToast('Error al exportar: ' + (err && err.message ? err.message : 'desconocido'));
  }).finally(() => {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '💾 Respaldo completo';
    }
  });
}

function importJSON(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    let backup;
    try {
      backup = JSON.parse(reader.result);
    } catch (e) {
      showToast('El archivo no es un JSON válido');
      resetImportInput();
      return;
    }
    if (!backup || !backup._meta || !backup.data || typeof backup.data !== 'object') {
      showToast('El archivo no es un respaldo de Asistencia 3D');
      resetImportInput();
      return;
    }
    showConfirmModal(
      '¿Restaurar datos desde este respaldo? Los datos actuales para las mismas fechas serán sobrescritos.',
      () => doImportJSON(backup),
      'Restaurar'
    );
  };
  reader.onerror = () => {
    showToast('No se pudo leer el archivo');
    resetImportInput();
  };
  reader.readAsText(file);
}

function doImportJSON(backup) {
  const data = sanitizeBackupData(backup.data);
  const restore = (window.FIREBASE_CONFIGURED && window.firebase)
    ? window.firebase.database().ref(FB_PATH).update(data)
    : Promise.resolve(restoreLocalData(data));
  restore.then(() => {
    const fecha = (backup._meta.exportDate || '').split('T')[0] || 'desconocida';
    showToast('Respaldo restaurado: ' + fecha);
    if (state.tab === 'reportes') {
      if (reportCourse) loadReport();
    } else if (state.course) {
      loadAttendance();
    }
  }).catch(err => {
    showToast('Error al restaurar: ' + (err && err.message ? err.message : 'desconocido'));
  }).finally(() => resetImportInput());
}

// Quita claves internas (empiezan con _) de un respaldo antes de restaurar:
// _editLog y similares son metadatos/logs, no datos de asistencia.
function sanitizeBackupData(data) {
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (k.startsWith('_')) continue;
    out[k] = v;
  }
  return out;
}

function restoreLocalData(data) {
  const current = readLocalData();
  for (const [k, v] of Object.entries(data)) {
    current[k] = v;
  }
  localStorage.setItem(LS_KEY, JSON.stringify(current));
}

function resetImportInput() {
  const input = $('#importFile');
  if (input) input.value = '';
}

// --- Recordatorio periódico de respaldo ---
// Cuenta cada persistencia real (persistMarks). Al exportar un respaldo,
// exportJSON resetea el contador y la fecha.
function bumpSaveCount() {
  try {
    const n = parseInt(localStorage.getItem('asistencia_3d_saveCount') || '0', 10);
    localStorage.setItem('asistencia_3d_saveCount', String(n + 1));
  } catch (e) { /* almacenamiento no disponible */ }
}

function checkBackupReminder() {
  try {
    const lastBackup = parseInt(localStorage.getItem('asistencia_3d_lastBackup') || '0', 10);
    const saveCount = parseInt(localStorage.getItem('asistencia_3d_saveCount') || '0', 10);
    // Sin respaldo previo: días = 0 para no molestar al primer uso; el
    // recordatorio lo dispara saveCount (>= 50 guardados sin respaldo).
    const daysSince = lastBackup ? Math.floor((Date.now() - lastBackup) / 86400000) : 0;
    if (saveCount >= 50 || daysSince >= 14) {
      showToast('Llevas tiempo sin hacer un respaldo. Ve a Reportes → Respaldo completo.', 5000);
    }
  } catch (e) { /* almacenamiento no disponible */ }
}

// --- Toast ---
function showToast(msg, duration) {
  let toast = $('#toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration || 2500);
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
window.installApp = installApp;
window.dismissInstallBanner = dismissInstallBanner;
