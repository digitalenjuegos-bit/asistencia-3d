/* ============================================
   EVENTOS ACADÉMICOS 2026-2027
   Logos Academy - Asistencia 3D
   ============================================
   Para actualizar el calendario solo hay que editar
   ACADEMIC_EVENTS y EVALUACION_SUMATIVA_P3. No hace
   falta tocar nada más de este archivo.
   ============================================ */

// --- Datos editables ---
// Cada evento: { id, titulo, fechaInicio (YYYY-MM-DD), fechaFin, tipo, descripcion }
// tipo: 'parcial' | 'vacaciones' | 'evaluacion' | 'aviso'
const ACADEMIC_EVENTS = [
  {
    id: 'p1',
    titulo: 'Parcial 1',
    fechaInicio: '2026-04-20',
    fechaFin: '2026-06-26',
    tipo: 'parcial',
    descripcion: 'Primer parcial del año lectivo 2026-2027.'
  },
  {
    id: 'p2',
    titulo: 'Parcial 2',
    fechaInicio: '2026-06-29',
    fechaFin: '2026-09-03',
    tipo: 'parcial',
    descripcion: 'Segundo parcial del año lectivo 2026-2027.'
  },
  {
    id: 'vac1',
    titulo: 'Vacaciones de medio año',
    fechaInicio: '2026-09-07',
    fechaFin: '2026-09-11',
    tipo: 'vacaciones',
    descripcion: 'Receso de medio año lectivo.'
  },
  {
    id: 'p3',
    titulo: 'Parcial 3',
    fechaInicio: '2026-09-14',
    fechaFin: '2026-11-20',
    tipo: 'parcial',
    descripcion: 'Tercer parcial del año lectivo 2026-2027.'
  },
  {
    id: 'ev3',
    titulo: 'Evaluación sumativa Parcial 3',
    fechaInicio: '2026-09-14',
    fechaFin: '2026-11-20',
    tipo: 'evaluacion',
    descripcion: 'Prueba escrita y proyectos por nivel. Detalle abajo. Ajusta las fechas cuando se confirmen las fechas exactas.'
  },
  {
    id: 'p4',
    titulo: 'Parcial 4',
    fechaInicio: '2026-11-23',
    fechaFin: '2027-02-05',
    tipo: 'parcial',
    descripcion: 'Cuarto parcial del año lectivo 2026-2027.'
  }
];

// Detalle de la evaluación sumativa del Parcial 3
const EVALUACION_SUMATIVA_P3 = {
  niveles: [
    {
      nivel: 'Básica (media y superior)',
      pruebaEscrita: ['Matemática', 'Literatura', 'Inglés'],
      proyecto: ['Programación', 'FHI', 'Física', 'Química', 'Biología', 'Historia', 'Inglés']
    },
    {
      nivel: '1ro BGU',
      pruebaEscrita: ['Lengua', 'Science', 'Inglés'],
      proyecto: ['Project', 'Programación', 'FHI', 'Matemática', 'Social St', 'Inglés']
    },
    {
      nivel: '2do y 3ro BGU',
      pruebaEscrita: ['Matemática', 'Electiva 1 (excepción Artes Visuales)', 'Electiva 2', 'Literatura', 'Inglés', 'Business', 'TDC*'],
      proyecto: ['Electiva 1: Artes Visuales', 'Historia (3ro)', 'FHI']
    }
  ],
  notas: [
    'Básica media a 1ro BGU evalúan solo el tercer parcial.',
    'IB de 2do y 3ro BGU: evaluación acumulativa.',
    'No IB de 2do y 3ro BGU: evalúan solo el tercer parcial.'
  ]
};

// --- Utilidades de fecha ---
function evParseDate(s) {
  const parts = s.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function evTodayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

function evFormatDate(s) {
  const parts = s.split('-').map(Number);
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return parts[2] + ' ' + meses[parts[1] - 1] + ' ' + parts[0];
}

function evDaysBetween(aStr, bStr) {
  const a = evParseDate(aStr);
  const b = evParseDate(bStr);
  return Math.round((b - a) / 86400000);
}

// Estado de un evento respecto a hoy: 'activo' | 'proximo' | 'finalizado'
function evEventStatus(ev) {
  const hoy = evTodayStr();
  if (hoy < ev.fechaInicio) {
    return { estado: 'proximo', dias: evDaysBetween(hoy, ev.fechaInicio) };
  }
  if (hoy > ev.fechaFin) {
    return { estado: 'finalizado', dias: 0 };
  }
  return { estado: 'activo', dias: 0 };
}

function evIcon(tipo) {
  switch (tipo) {
    case 'parcial': return '&#128197;';
    case 'vacaciones': return '&#127796;';
    case 'evaluacion': return '&#128221;';
    case 'aviso': return '&#128276;';
    default: return '&#128197;';
  }
}

function evStatusBadge(st) {
  if (st.estado === 'activo') {
    return '<span class="event-badge active">En curso</span>';
  }
  if (st.estado === 'proximo') {
    const d = st.dias;
    return '<span class="event-badge upcoming">En ' + d + (d === 1 ? ' día' : ' días') + '</span>';
  }
  return '<span class="event-badge done">Finalizado</span>';
}

// --- Render: calendario de parciales ---
function renderTimeline() {
  const el = document.getElementById('eventsTimeline');
  if (!el) return;
  const items = ACADEMIC_EVENTS.filter(function (e) {
    return e.tipo === 'parcial' || e.tipo === 'vacaciones';
  });
  el.innerHTML = items.map(function (ev) {
    const st = evEventStatus(ev);
    return (
      '<div class="event-item ' + ev.tipo + '">' +
        '<div class="event-icon">' + evIcon(ev.tipo) + '</div>' +
        '<div class="event-body">' +
          '<div class="event-head">' +
            '<span class="event-title">' + ev.titulo + '</span>' +
            evStatusBadge(st) +
          '</div>' +
          '<div class="event-dates">' + evFormatDate(ev.fechaInicio) + ' al ' + evFormatDate(ev.fechaFin) + '</div>' +
          (ev.descripcion ? '<div class="event-desc">' + ev.descripcion + '</div>' : '') +
        '</div>' +
      '</div>'
    );
  }).join('');
}

// --- Render: evaluación sumativa Parcial 3 ---
function renderSumativa() {
  const el = document.getElementById('eventsSumativa');
  if (!el) return;
  const d = EVALUACION_SUMATIVA_P3;
  const html = d.niveles.map(function (n) {
    return (
      '<div class="sumativa-nivel">' +
        '<h3 class="sumativa-nivel-title">' + n.nivel + '</h3>' +
        '<div class="sumativa-cols">' +
          '<div class="sumativa-col">' +
            '<span class="sumativa-label">Prueba escrita</span>' +
            '<ul class="sumativa-list">' + n.pruebaEscrita.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul>' +
          '</div>' +
          '<div class="sumativa-col">' +
            '<span class="sumativa-label">Proyecto</span>' +
            '<ul class="sumativa-list">' + n.proyecto.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }).join('');
  const notas = '<div class="sumativa-notas"><strong>Notas:</strong><ul>' +
    d.notas.map(function (n) { return '<li>' + n + '</li>'; }).join('') + '</ul></div>';
  el.innerHTML = html + notas;
}

// --- Render: próximos eventos ---
function renderUpcoming() {
  const el = document.getElementById('eventsUpcoming');
  if (!el) return;
  const hoy = evTodayStr();
  const upcoming = ACADEMIC_EVENTS
    .filter(function (ev) { return ev.fechaFin >= hoy; })
    .sort(function (a, b) { return a.fechaInicio.localeCompare(b.fechaInicio); })
    .slice(0, 4);
  if (!upcoming.length) {
    el.innerHTML = '<div class="empty-state"><span class="icon">&#128197;</span><p>No hay eventos próximos</p></div>';
    return;
  }
  el.innerHTML = upcoming.map(function (ev) {
    const st = evEventStatus(ev);
    let badge;
    if (st.estado === 'activo') {
      badge = '<span class="event-badge active">En curso</span>';
    } else if (st.estado === 'proximo') {
      badge = '<span class="event-badge upcoming">Comienza en ' + st.dias + (st.dias === 1 ? ' día' : ' días') + '</span>';
    } else {
      badge = '<span class="event-badge done">Finalizado</span>';
    }
    return (
      '<div class="event-item ' + ev.tipo + '">' +
        '<div class="event-icon">' + evIcon(ev.tipo) + '</div>' +
        '<div class="event-body">' +
          '<div class="event-head">' +
            '<span class="event-title">' + ev.titulo + '</span>' +
            badge +
          '</div>' +
          '<div class="event-dates">' + evFormatDate(ev.fechaInicio) + ' al ' + evFormatDate(ev.fechaFin) + '</div>' +
        '</div>' +
      '</div>'
    );
  }).join('');
}

// ============================================
// NOTIFICACIONES DE ESCRITORIO
// ============================================
const NOTIF_PREFS_KEY = 'asistencia3d_notif_prefs';
const NOTIF_LAST_KEY = 'asistencia3d_notif_last';

function evLoadPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(NOTIF_PREFS_KEY));
    if (p && typeof p === 'object') return p;
  } catch (e) { /* ignorar */ }
  return { activadas: false, diario: false };
}

function evSavePrefs(prefs) {
  localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(prefs));
}

function evNotify(titulo, cuerpo) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    const n = new Notification(titulo, { body: cuerpo, icon: 'icons/icon-192.png' });
    setTimeout(function () { n.close(); }, 15000);
  } catch (e) {
    // Algunos navegadores exigen service worker registrado; se ignora.
  }
}

// Chequeo diario: notifica una sola vez por día los eventos relevantes.
function evCheckDaily() {
  const prefs = evLoadPrefs();
  if (!prefs.activadas || !prefs.diario) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const hoy = evTodayStr();
  if (localStorage.getItem(NOTIF_LAST_KEY) === hoy) return;

  const mensajes = [];
  for (let i = 0; i < ACADEMIC_EVENTS.length; i++) {
    const ev = ACADEMIC_EVENTS[i];
    const st = evEventStatus(ev);
    const duracion = evDaysBetween(ev.fechaInicio, ev.fechaFin);
    if (st.estado === 'activo') {
      if (hoy === ev.fechaInicio) {
        mensajes.push('Hoy inicia: ' + ev.titulo);
      } else if (hoy === ev.fechaFin) {
        mensajes.push('Hoy finaliza: ' + ev.titulo);
      } else if (duracion <= 14) {
        // Solo eventos cortos (vacaciones, evaluaciones) se recuerdan a diario;
        // los parciales largos solo avisan en su inicio y su fin.
        mensajes.push('En curso: ' + ev.titulo);
      }
    } else if (st.estado === 'proximo' && st.dias <= 3) {
      mensajes.push('En ' + st.dias + (st.dias === 1 ? ' día: ' : ' días: ') + ev.titulo);
    }
  }

  if (mensajes.length) {
    evNotify('Eventos académicos', mensajes.join(' | '));
  }
  localStorage.setItem(NOTIF_LAST_KEY, hoy);
}

function initNotificaciones() {
  const enableBtn = document.getElementById('notifEnableBtn');
  const toggle = document.getElementById('notifDailyToggle');
  const status = document.getElementById('notifStatus');
  if (!enableBtn || !toggle || !status) return;

  const prefs = evLoadPrefs();

  function updateUI() {
    if (!('Notification' in window)) {
      status.textContent = 'Este navegador no soporta notificaciones de escritorio.';
      enableBtn.disabled = true;
      toggle.disabled = true;
      return;
    }
    const perm = Notification.permission;
    if (perm === 'granted') {
      status.textContent = 'Notificaciones activadas.';
      enableBtn.textContent = 'Notificaciones activadas';
      enableBtn.disabled = true;
      toggle.disabled = false;
      toggle.checked = !!prefs.diario;
    } else if (perm === 'denied') {
      status.textContent = 'Notificaciones bloqueadas por el navegador. Actívalas desde la configuración del sitio.';
      enableBtn.disabled = true;
      toggle.disabled = true;
    } else {
      status.textContent = 'Las notificaciones están desactivadas.';
      enableBtn.disabled = false;
      toggle.disabled = true;
    }
  }

  enableBtn.addEventListener('click', function () {
    if (!('Notification' in window)) return;
    Notification.requestPermission().then(function (perm) {
      if (perm === 'granted') {
        prefs.activadas = true;
        evSavePrefs(prefs);
        evNotify('Notificaciones activadas', 'Recibirás avisos de los eventos académicos.');
      }
      updateUI();
    });
  });

  toggle.addEventListener('change', function () {
    prefs.diario = toggle.checked;
    evSavePrefs(prefs);
    if (prefs.diario) {
      evCheckDaily();
    }
  });

  updateUI();
  evCheckDaily();
}

// --- Horario académico ---
// Franjas del día. Las que tienen 'fija' se repiten todos los días.
const HORARIO_FRANJAS = [
  { id: '1', hora: '7:15-8:00' },
  { id: '2', hora: '8:05-8:50' },
  { id: '3', hora: '8:55-9:40' },
  { id: 'break', hora: '9:40-9:55', fija: 'Receso' },
  { id: 'ap', hora: '9:55-10:05', fija: 'Atención Plena' },
  { id: '4', hora: '10:05-10:50' },
  { id: '5', hora: '10:55-11:40' },
  { id: '6', hora: '11:50-12:30' },
  { id: 'lunch', hora: '12:30-13:05', fija: 'Almuerzo' },
  { id: '7', hora: '13:05-13:50' }
];

const HORARIO_DIAS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi'];

// Celdas por día y franja. 'movida' marca el cambio solicitado
// (Historia 1B pasó de la 5ta hora del viernes a la 5ta hora del miércoles).
// 'fusionada' indica una celda que ocupa dos franjas (colspan=2).
const HORARIO_ACADEMICO = {
  Lu: {
    '3': { texto: 'Historia', curso: '1B' },
    '4': { texto: 'Historia', curso: '1C' },
    '5': { texto: 'Historia', curso: '1A' },
    '7': { texto: 'Economía', curso: '2A/2B/2C' }
  },
  Ma: {
    '2': { texto: 'Economía', curso: '2A/2B/2C' },
    '4': { texto: 'Historia', curso: '1C' },
    '6': { texto: 'Historia', curso: '1B' },
    '7': { texto: 'Historia', curso: '1A' }
  },
  Mi: {
    '1': { texto: 'Economía', curso: '3A/3B/3C' },
    '5': { texto: 'Historia', curso: '1B', movida: true },
    '7': { texto: 'Taller A/A', curso: '1A/1B/1C/2A/2B/2C/3A/3B/3C' }
  },
  Ju: {
    '1': { texto: 'Economía', curso: '2A/2B/2C' },
    '2': { texto: 'Economía', curso: '3A/3B/3C' },
    '4': { texto: 'RdA', curso: '', fusionada: true },
    '6': { texto: 'Taller A/A', curso: '1A/1B/1C/2A/2B/2C/3A/3B/3C' }
  },
  Vi: {
    '1': { texto: 'Economía', curso: '2A/2B/2C' },
    '3': { texto: 'Historia', curso: '1C' },
    '4': { texto: 'Economía', curso: '3A/3B/3C' },
    '6': { texto: 'Historia', curso: '1A' }
  }
};

function horarioClaseAsignatura(texto) {
  if (/econom/i.test(texto)) return 'horario-econ';
  if (/hist/i.test(texto)) return 'horario-hist';
  if (/taller/i.test(texto)) return 'horario-taller';
  if (/rda|roa/i.test(texto)) return 'horario-rda';
  return '';
}

function renderHorario() {
  const cont = document.getElementById('horarioTabla');
  if (!cont) return;

  let html = '<table class="horario"><thead><tr><th class="horario-dia">Día</th>';
  HORARIO_FRANJAS.forEach(function (f) {
    html += '<th>' + f.id + '<small>' + f.hora + '</small></th>';
  });
  html += '</tr></thead><tbody>';

  HORARIO_DIAS.forEach(function (dia) {
    html += '<tr><th class="horario-dia">' + dia + '</th>';
    let saltar = false;
    HORARIO_FRANJAS.forEach(function (f) {
      if (saltar) { saltar = false; return; }
      if (f.fija) {
        html += '<td class="horario-fija">' + f.fija + '</td>';
        return;
      }
      const celda = HORARIO_ACADEMICO[dia] && HORARIO_ACADEMICO[dia][f.id];
      if (!celda) {
        html += '<td class="horario-vacia"></td>';
        return;
      }
      let cls = 'horario-celda ' + horarioClaseAsignatura(celda.texto);
      if (celda.movida) cls += ' horario-cambio';
      if (celda.fusionada) { cls += ' horario-fusion'; saltar = true; }
      html += '<td class="' + cls + '"' + (celda.fusionada ? ' colspan="2"' : '') + '>';
      html += '<span class="horario-texto">' + celda.texto + '</span>';
      if (celda.curso) html += '<small class="horario-curso">' + celda.curso + '</small>';
      html += '</td>';
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  cont.innerHTML = html;
}

// --- Inicialización ---
function initEvents() {
  renderHorario();
  renderTimeline();
  renderSumativa();
  renderUpcoming();
  initNotificaciones();
}