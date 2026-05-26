
// ========== MedCode Pro Palpa Mobile v2.0 PRO ==========
// Ing. Fernando Mantilla Lozano - Hospital de Apoyo Palpa UE 407

// Estado global
let state = {
  query: '',
  filter: 'todos',
  page: 1,
  perPage: 15,
  view: 'search',  // search | favorites | info | ai
  expanded: new Set(),
  favs: JSON.parse(localStorage.getItem('mcp_favs') || '[]'),
  recognition: null,
  listening: false,
  micMode: 'search',  // 'search' o 'ai' (modo asistente)
  aiHistory: JSON.parse(localStorage.getItem('mcp_ai_history') || '[]')
};

// ========== CATEGORÍAS ==========
const catLabels = {
  diagnostico:'Dx', procedimiento:'Proc', suplementacion:'Supl',
  materno:'Mat', dengue:'Dengue', dental:'Dental', cesado:'⚠ Ces', profam:'PROFAM'
};
const catColors = {
  diagnostico:'#ef4444', procedimiento:'#3b82f6', suplementacion:'#f59e0b',
  materno:'#06b6d4', dengue:'#a855f7', dental:'#8b5cf6', cesado:'#ef4444', profam:'#10b981'
};
const filtros = [
  {id:'todos', label:'🔍 Todos'},
  {id:'profam', label:'👨‍👩‍👧‍👦 PROFAM/APP'},
  {id:'materno', label:'🤰 Materno'},
  {id:'suplementacion', label:'💊 Suplem.'},
  {id:'dengue', label:'🦟 Dengue'},
  {id:'procedimiento', label:'⚕️ Procedim.'},
  {id:'diagnostico', label:'🩺 Diagnóstico'},
  {id:'dental', label:'🦷 Dental'},
  {id:'cesado', label:'🚫 Cesados'}
];

// ========== RELOJ ==========
function actualizarReloj() {
  const ahora = new Date();
  const fmt = ahora.toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    weekday: 'short', day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
  const el = document.getElementById('clock');
  if (el) el.textContent = fmt;
}
setInterval(actualizarReloj, 1000); actualizarReloj();

// ========== KPIs ==========
function renderKPIs() {
  const total = DB_LAB.length + DB_REF.length;
  const cie10 = DB_REF.filter(x => x[0] && /^[A-Z]\d/.test(x[0])).length +
                DB_LAB.filter(x => x.codigo && /^[A-Z]\d/.test(x.codigo)).length;
  const proc = total - cie10;
  const curados = DB_LAB.length;
  const cesados = DB_LAB.filter(x => x.cat==='cesado').length;
  const profam = DB_LAB.filter(x => x.codigo && (x.codigo.startsWith('C0')||x.codigo.startsWith('C3'))).length +
                 DB_REF.filter(x => x[0] && (x[0].startsWith('C0')||x[0].startsWith('C3'))).length;
  const kpis = [
    {v:total.toLocaleString(), l:'Total', i:'📚', c:'#3b82f6'},
    {v:cie10.toLocaleString(), l:'CIE-10', i:'🏥', c:'#ef4444'},
    {v:proc.toLocaleString(), l:'Procedim.', i:'⚕️', c:'#10b981'},
    {v:curados, l:'LAB ⭐', i:'⭐', c:'#fbbf24'},
    {v:cesados, l:'Cesados', i:'🚫', c:'#ef4444'},
    {v:profam, l:'PROFAM', i:'👨‍👩‍👧‍👦', c:'#10b981'}
  ];
  const html = kpis.map(k => `
    <div class="kpi" style="background:linear-gradient(135deg,${k.c}15,var(--card))" onclick="usarSugerencia('')">
      <div class="kpi-icon" style="background:${k.c}30; color:${k.c}">${k.i}</div>
      <div class="kpi-value">${k.v}</div>
      <div class="kpi-label">${k.l}</div>
    </div>
  `).join('');
  document.getElementById('kpis').innerHTML = html;
}

// ========== FILTROS ==========
function renderFilters() {
  document.getElementById('filters').innerHTML = filtros.map(f => `
    <button class="chip ${state.filter===f.id?'active':''}" onclick="setFilter('${f.id}')">
      ${f.label}
    </button>
  `).join('');
}

function setFilter(id) {
  state.filter = id;
  state.page = 1;
  state.expanded.clear();
  renderFilters();
  renderResults();
  showToast('Filtro: ' + filtros.find(f=>f.id===id).label.replace(/[🔍👨‍👩‍👧‍👦🤰💊🦟⚕️🩺🦷🚫]/g, '').trim(), 'info');
  
  // Scroll suave a resultados
  setTimeout(() => {
    const r = document.getElementById('results');
    if (r) r.scrollIntoView({behavior:'smooth', block:'start'});
  }, 100);
}

// ========== BÚSQUEDA ==========
function normalizar(s) {
  return (s||'').toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9.]/g,' ').replace(/\s+/g,' ').trim();
}

function buscar(q, filtro) {
  const qn = normalizar(q);
  let results = [];
  
  // ===== CASO ESPECIAL: FILTROS sin query =====
  if (filtro === 'profam') {
    // Mostrar TODOS los códigos PROFAM (C0XXX y C3XXX) sin importar query
    const labProfam = DB_LAB.filter(x => x.codigo && (x.codigo.startsWith('C0')||x.codigo.startsWith('C3'))).map(x => ({...x, _lab:true}));
    const refProfam = DB_REF.filter(x => x[0] && (x[0].startsWith('C0')||x[0].startsWith('C3'))).map(x => ({codigo:x[0], nombre:x[1], cat:x[2]||'profam', _lab:false}));
    results = [...labProfam, ...refProfam];
    if (qn) {
      results = results.filter(x => normalizar(x.codigo).includes(qn) || normalizar(x.nombre).includes(qn));
    }
    return results;
  }
  
  if (filtro === 'cesado') {
    results = DB_LAB.filter(x => x.cat === 'cesado').map(x => ({...x, _lab:true}));
    if (qn) {
      results = results.filter(x => normalizar(x.codigo).includes(qn) || normalizar(x.nombre).includes(qn));
    }
    return results;
  }
  
  if (filtro === 'favs') {
    const favSet = new Set(state.favs);
    const labFavs = DB_LAB.filter(x => favSet.has(x.codigo)).map(x => ({...x, _lab:true}));
    const refFavs = DB_REF.filter(x => favSet.has(x[0])).map(x => ({codigo:x[0], nombre:x[1], cat:x[2]||'procedimiento', _lab:false}));
    results = [...labFavs, ...refFavs];
    if (qn) {
      results = results.filter(x => normalizar(x.codigo).includes(qn) || normalizar(x.nombre).includes(qn));
    }
    return results;
  }
  
  // ===== Filtros por categoría (materno, dengue, etc) =====
  if (filtro !== 'todos') {
    const labCat = DB_LAB.filter(x => x.cat === filtro).map(x => ({...x, _lab:true}));
    const refCat = DB_REF.filter(x => x[2] === filtro).map(x => ({codigo:x[0], nombre:x[1], cat:x[2], _lab:false}));
    results = [...labCat, ...refCat];
    if (qn) {
      results = results.filter(x => normalizar(x.codigo).includes(qn) || normalizar(x.nombre).includes(qn));
    }
    return results;
  }
  
  // ===== Filtro 'todos' =====
  if (!qn) {
    // Sin query: mostrar primero los códigos con LAB curado (los más útiles)
    return DB_LAB.map(x => ({...x, _lab:true}));
  }
  
  // Con query: buscar en TODA la base
  const labMatches = DB_LAB.filter(x => 
    normalizar(x.codigo).includes(qn) || normalizar(x.nombre).includes(qn)
  ).map(x => ({...x, _lab:true}));
  
  const refMatches = DB_REF.filter(x => 
    normalizar(x[0]).includes(qn) || normalizar(x[1]).includes(qn)
  ).map(x => ({codigo:x[0], nombre:x[1], cat:x[2]||'procedimiento', _lab:false}));
  
  results = [...labMatches, ...refMatches];
  
  // Ordenamiento inteligente: coincidencia exacta de código primero
  results.sort((a,b) => {
    const aExact = normalizar(a.codigo) === qn ? 1 : 0;
    const bExact = normalizar(b.codigo) === qn ? 1 : 0;
    if (aExact !== bExact) return bExact - aExact;
    if (a._lab !== b._lab) return b._lab - a._lab;
    return (a.codigo||'').localeCompare(b.codigo||'');
  });
  
  return results;
}

// ========== RENDER RESULTADOS ==========
function renderResults() {
  const results = buscar(state.query, state.filter);
  const total = results.length;
  const start = (state.page - 1) * state.perPage;
  const pageResults = results.slice(start, start + state.perPage);
  const totalPages = Math.ceil(total / state.perPage);
  
  document.getElementById('count').textContent = total.toLocaleString();
  
  const container = document.getElementById('results');
  
  if (total === 0) {
    let icono = '🔍', titulo = 'Sin resultados', msg = '';
    
    if (state.filter === 'favs') {
      icono = '⭐';
      titulo = 'No tienes favoritos aún';
      msg = 'Marca con la estrella ☆ los códigos que más uses para acceso rápido.';
    } else if (state.filter === 'profam') {
      icono = '👨‍👩‍👧‍👦';
      titulo = 'No se encontraron códigos PROFAM con esa búsqueda';
      msg = 'Limpia el buscador para ver todos los códigos PROFAM/APP.';
    } else if (state.query) {
      msg = `No encontramos coincidencias para "<b>${state.query}</b>".<br>Prueba con otra palabra o limpia el filtro.`;
    } else {
      msg = 'Empieza escribiendo o usa el micrófono 🎤';
    }
    
    container.innerHTML = `
      <div class="empty">
        <div class="empty-icon">${icono}</div>
        <div class="empty-title">${titulo}</div>
        <div class="empty-text">${msg}</div>
        <div class="empty-chips">
          <button class="chip" onclick="usarSugerencia('dengue')">dengue</button>
          <button class="chip" onclick="usarSugerencia('anemia')">anemia</button>
          <button class="chip" onclick="usarSugerencia('I10X')">I10X</button>
          <button class="chip" onclick="usarSugerencia('CRED')">CRED</button>
          <button class="chip" onclick="usarSugerencia('PROFAM')">PROFAM</button>
          <button class="chip" onclick="usarSugerencia('')">Ver todos</button>
        </div>
      </div>
    `;
    document.getElementById('pagination').innerHTML = '';
    return;
  }
  
  container.innerHTML = pageResults.map(r => renderCard(r)).join('');
  renderPagination(totalPages);
}

function renderCard(r) {
  const isExpanded = state.expanded.has(r.codigo);
  const isFav = state.favs.includes(r.codigo);
  const catColor = catColors[r.cat] || '#64748b';
  const catLabel = catLabels[r.cat] || r.cat;
  const isCesado = r.cat === 'cesado';
  
  // Si el código empieza con C0 o C3 (PROFAM), forzar categoría
  let displayCat = r.cat;
  let displayCatLabel = catLabel;
  let displayCatColor = catColor;
  if (r.codigo && (r.codigo.startsWith('C0') || r.codigo.startsWith('C3'))) {
    if (!r._lab) {
      displayCat = 'profam';
      displayCatLabel = '👨‍👩‍👧‍👦 PROFAM';
      displayCatColor = '#10b981';
    }
  }
  
  let detail = '';
  if (isExpanded) {
    if (r._lab) {
      // Detalle completo para LAB curado
      detail = `
        <div class="result-detail">
          ${isCesado ? `<div class="cesado-banner">⚠️ CÓDIGO CESADO. ${r.alternativa ? 'Alternativa: <b>' + r.alternativa + '</b>' : 'Ver alternativa en el manual oficial.'}</div>` : ''}
          
          ${r.labMeaning && r.labMeaning.length > 0 ? `
          <div class="detail-section">
            <div class="detail-title">📝 ¿Qué va en el campo LAB?</div>
            <div class="lab-table">
              ${r.labMeaning.map(lm => `
                <div class="lab-row">
                  <div class="lab-key">${lm.v}</div>
                  <div class="lab-desc">${lm.d}</div>
                </div>
              `).join('')}
            </div>
          </div>` : ''}
          
          ${r.examples && r.examples.length ? `
          <div class="detail-section">
            <div class="detail-title">💡 Ejemplos de uso en diferentes condiciones</div>
            ${r.examples.map(ex => `
              <div class="example">
                <div class="example-ctx">${ex.contexto}</div>
                <div class="example-fields">
                  ${ex.campos.map(c => `<span class="field-tag">${c.l}=<b>${c.v}</b></span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>` : ''}
          
          ${r.nota ? `<div class="note"><b>📌 Nota:</b> ${r.nota}</div>` : ''}
          ${r.extra ? `<div class="note" style="background:rgba(59,130,246,.08); border-left-color:#3b82f6"><b>📖 Origen:</b> ${r.extra}</div>` : ''}
          
          <div class="action-row">
            <button class="action-btn primary" onclick="preguntarIA('${r.codigo}', event)">
              🤖 Pregunta IA
            </button>
            <button class="action-btn" onclick="copiarCodigo('${r.codigo}', event)">
              📋 Copiar
            </button>
            <button class="action-btn" onclick="toggleFav('${r.codigo}', event)">
              ${isFav ? '⭐' : '☆'}
            </button>
          </div>
        </div>
      `;
    } else {
      // Detalle simple para REF (sin LAB curado)
      detail = `
        <div class="result-detail">
          <div class="note" style="background:rgba(59,130,246,.08); border-left-color:#3b82f6">
            <b>ℹ️ Información:</b> Este código está en la base de referencia rápida. No tiene un bloque LAB curado específico todavía, pero puedes consultar al asistente IA o copiarlo para usarlo.
          </div>
          <div class="action-row">
            <button class="action-btn primary" onclick="preguntarIA('${r.codigo}', event)">
              🤖 Pregunta IA sobre este código
            </button>
            <button class="action-btn" onclick="copiarCodigo('${r.codigo}', event)">
              📋 Copiar
            </button>
            <button class="action-btn" onclick="toggleFav('${r.codigo}', event)">
              ${isFav ? '⭐' : '☆'}
            </button>
          </div>
        </div>
      `;
    }
  }
  
  return `
    <div class="result-card ${isExpanded?'expanded':''} ${isCesado?'cesado':''} ${r._lab?'lab-curated':''}" onclick="toggleExpand('${r.codigo}')">
      ${r._lab ? '<div class="result-star">⭐</div>' : ''}
      <div class="result-head">
        <div class="result-code">${r.codigo}</div>
        <div class="result-cat" style="background:${displayCatColor}25; color:${displayCatColor}">${displayCatLabel}</div>
      </div>
      <div class="result-name">${r.nombre}</div>
      ${detail}
    </div>
  `;
}

function toggleExpand(codigo) {
  if (state.expanded.has(codigo)) {
    state.expanded.delete(codigo);
  } else {
    state.expanded.add(codigo);
  }
  renderResults();
}

// ========== PAGINACIÓN ==========
function renderPagination(totalPages) {
  if (totalPages <= 1) {
    document.getElementById('pagination').innerHTML = '';
    return;
  }
  let html = '';
  html += `<button class="page-btn" ${state.page<=1?'disabled':''} onclick="cambiarPagina(${state.page-1})">←</button>`;
  
  const pages = generarPaginas(state.page, totalPages);
  pages.forEach(p => {
    if (p === '...') {
      html += `<span class="page-btn" style="border:none; background:none">…</span>`;
    } else {
      html += `<button class="page-btn ${p===state.page?'active':''}" onclick="cambiarPagina(${p})">${p}</button>`;
    }
  });
  
  html += `<button class="page-btn" ${state.page>=totalPages?'disabled':''} onclick="cambiarPagina(${state.page+1})">→</button>`;
  document.getElementById('pagination').innerHTML = html + `<div class="page-info">Pág. ${state.page} de ${totalPages}</div>`;
}

function generarPaginas(current, total) {
  const pages = [];
  if (total <= 7) {
    for (let i=1; i<=total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    for (let i=Math.max(2,current-1); i<=Math.min(total-1,current+1); i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
  }
  return pages;
}

function cambiarPagina(p) {
  state.page = p;
  renderResults();
  const target = document.getElementById('searchWrap');
  if (target) {
    window.scrollTo({top: target.offsetTop - 60, behavior:'smooth'});
  }
}

// ========== ACCIONES ==========
function copiarCodigo(codigo, ev) {
  if (ev) ev.stopPropagation();
  navigator.clipboard.writeText(codigo).then(() => {
    showToast('✅ Código ' + codigo + ' copiado', 'success');
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = codigo;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('✅ Código ' + codigo + ' copiado', 'success');
    } catch(e) {
      showToast('❌ No se pudo copiar', 'error');
    }
    document.body.removeChild(ta);
  });
}

function toggleFav(codigo, ev) {
  if (ev) ev.stopPropagation();
  const idx = state.favs.indexOf(codigo);
  if (idx >= 0) {
    state.favs.splice(idx, 1);
    showToast('☆ Quitado de favoritos');
  } else {
    state.favs.push(codigo);
    showToast('⭐ Agregado a favoritos', 'success');
  }
  localStorage.setItem('mcp_favs', JSON.stringify(state.favs));
  renderResults();
}

function usarSugerencia(q) {
  document.getElementById('searchInput').value = q;
  state.query = q;
  state.page = 1;
  state.expanded.clear();
  renderResults();
  toggleClearBtn();
}

function showToast(msg, type='') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.innerHTML = msg;
  t.className = 'toast ' + type;
  setTimeout(() => t.classList.add('show'), 10);
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ========== INPUT ==========
function onSearchInput(value) {
  state.query = value;
  state.page = 1;
  state.expanded.clear();
  renderResults();
  toggleClearBtn();
}

function toggleClearBtn() {
  const btn = document.getElementById('clearBtn');
  if (!btn) return;
  if (document.getElementById('searchInput').value) {
    btn.classList.add('show');
  } else {
    btn.classList.remove('show');
  }
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  state.query = '';
  state.page = 1;
  state.expanded.clear();
  renderResults();
  toggleClearBtn();
  document.getElementById('searchInput').focus();
}

// ========== BÚSQUEDA POR VOZ (Web Speech API) ==========
function initVoz() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    console.warn('Web Speech API no soportada');
    return false;
  }
  state.recognition = new SR();
  state.recognition.lang = 'es-PE';
  state.recognition.continuous = false;
  state.recognition.interimResults = true;
  state.recognition.maxAlternatives = 3;
  
  state.recognition.onstart = () => {
    state.listening = true;
    document.getElementById('micOverlay').classList.add('show');
    document.getElementById('micBtn').classList.add('active');
    const statusEl = document.getElementById('micStatus');
    if (statusEl) statusEl.textContent = state.micMode === 'ai' ? '🤖 Hazme una pregunta...' : '🎤 Escuchando...';
    const textEl = document.getElementById('micText');
    if (textEl) textEl.textContent = state.micMode === 'ai' ? 
      'Ej: "¿Qué pongo en el campo LAB del código I10X?"' : 
      'Diga el código o nombre que busca';
    if (navigator.vibrate) navigator.vibrate(50);
  };
  
  state.recognition.onresult = (e) => {
    let interim = '';
    let final = '';
    for (let i=e.resultIndex; i<e.results.length; i++) {
      const transcript = e.results[i][0].transcript;
      if (e.results[i].isFinal) {
        final += transcript;
      } else {
        interim += transcript;
      }
    }
    const textEl = document.getElementById('micText');
    if (textEl) textEl.textContent = '"' + (final || interim || '...') + '"';
    
    if (final) {
      if (state.micMode === 'ai') {
        // Modo asistente IA
        cerrarMic();
        setTimeout(() => responderIA(final), 300);
      } else {
        // Modo búsqueda
        const procesado = procesarTextoVoz(final);
        document.getElementById('searchInput').value = procesado;
        state.query = procesado;
        state.page = 1;
        renderResults();
        toggleClearBtn();
        setTimeout(cerrarMic, 800);
      }
    }
  };
  
  state.recognition.onerror = (e) => {
    console.error('Speech error:', e.error);
    const statusEl = document.getElementById('micStatus');
    const textEl = document.getElementById('micText');
    
    let mensajeError = '❌ Error';
    let descripcion = 'Intenta de nuevo';
    
    if (e.error === 'not-allowed' || e.error === 'permission-denied') {
      mensajeError = '🚫 Sin permiso';
      descripcion = 'Habilita el micrófono en la configuración del navegador';
    } else if (e.error === 'no-speech') {
      mensajeError = '🔇 No te escuché';
      descripcion = 'Habla más fuerte o cerca del micrófono';
    } else if (e.error === 'audio-capture') {
      mensajeError = '🎙️ Sin micrófono';
      descripcion = 'No se detectó micrófono en este dispositivo';
    } else if (e.error === 'network') {
      mensajeError = '🌐 Sin internet';
      descripcion = 'La búsqueda por voz requiere conexión a internet';
    } else if (e.error === 'aborted') {
      // Usuario canceló, no mostrar error
      return;
    }
    
    if (statusEl) statusEl.textContent = mensajeError;
    if (textEl) textEl.textContent = descripcion;
    setTimeout(cerrarMic, 2500);
  };
  
  state.recognition.onend = () => {
    state.listening = false;
    document.getElementById('micBtn').classList.remove('active');
  };
  
  return true;
}

function procesarTextoVoz(texto) {
  const numWords = {
    'cero':'0','uno':'1','dos':'2','tres':'3','cuatro':'4','cinco':'5',
    'seis':'6','siete':'7','ocho':'8','nueve':'9','diez':'10',
    'punto':'.','guion':'-'
  };
  let t = texto.toLowerCase().trim();
  Object.entries(numWords).forEach(([w, n]) => {
    t = t.replace(new RegExp('\\b' + w + '\\b', 'g'), n);
  });
  t = t.replace(/\b(buscar?|c[oó]digo|de|el|la|los|las)\b/g, '').trim();
  t = t.replace(/\s+/g, ' ');
  return t;
}

async function activarMic(modo) {
  state.micMode = modo || 'search';
  
  if (!state.recognition) {
    const ok = initVoz();
    if (!ok) {
      showToast('❌ Tu navegador no soporta búsqueda por voz. Usa Chrome o Edge.', 'error');
      return;
    }
  }
  
  if (state.listening) {
    state.recognition.stop();
    return;
  }
  
  // Pedir permiso explícitamente (mejora compatibilidad)
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    }
  } catch (err) {
    showToast('🚫 Necesitas permitir el micrófono', 'error');
    document.getElementById('micOverlay').classList.add('show');
    document.getElementById('micStatus').textContent = '🚫 Permiso denegado';
    document.getElementById('micText').innerHTML = 'Habilita el micrófono en:<br>Ajustes Chrome → Sitio → Permisos → Micrófono';
    setTimeout(cerrarMic, 4000);
    return;
  }
  
  try {
    state.recognition.start();
  } catch (e) {
    console.error('Error iniciar mic:', e);
    showToast('❌ Error al activar el micrófono', 'error');
  }
}

function cerrarMic() {
  if (state.recognition && state.listening) {
    try { state.recognition.stop(); } catch(e) {}
  }
  document.getElementById('micOverlay').classList.remove('show');
}

// ========== ASISTENTE IA ==========
// Sistema de respuesta inteligente que analiza la pregunta del usuario
// y responde con la información del código (sin necesidad de servidor)

function preguntarIA(codigo, ev) {
  if (ev) ev.stopPropagation();
  // Abrir el sheet de IA con el código preseleccionado
  state.aiContext = codigo;
  abrirSheetIA(codigo);
}

function abrirSheetIA(codigoInicial) {
  document.getElementById('sheetOverlay').classList.add('show');
  setTimeout(() => document.getElementById('aiSheet').classList.add('show'), 10);
  if (codigoInicial) {
    const info = obtenerInfoCodigo(codigoInicial);
    if (info) {
      agregarMensajeIA('user', `Cuéntame sobre el código ${codigoInicial}`);
      setTimeout(() => agregarMensajeIA('ai', generarRespuestaCodigo(info)), 400);
    }
  } else if (state.aiHistory.length === 0) {
    agregarMensajeIA('ai', `👋 Hola Doctor(a). Soy tu asistente IA del HIS-MINSA.

Puedo ayudarte con:
• 📝 Cómo llenar el campo LAB de un código
• 💡 Ejemplos según la condición del paciente
• 🩺 Qué código usar para una situación
• ⚠️ Códigos cesados y sus alternativas

Pregunta lo que necesites por texto o por voz 🎤`);
  }
  renderChatIA();
}

function cerrarSheetIA() {
  document.getElementById('aiSheet').classList.remove('show');
  setTimeout(() => {
    document.getElementById('sheetOverlay').classList.remove('show');
  }, 250);
}

function obtenerInfoCodigo(codigo) {
  // Buscar en DB_LAB primero
  const lab = DB_LAB.find(x => x.codigo === codigo);
  if (lab) return {...lab, _lab:true};
  // Buscar en DB_REF
  const ref = DB_REF.find(x => x[0] === codigo);
  if (ref) return {codigo:ref[0], nombre:ref[1], cat:ref[2], _lab:false};
  return null;
}

function generarRespuestaCodigo(info) {
  let html = `<b style="color:#3b82f6">${info.codigo}</b> · <i>${info.nombre}</i>\n\n`;
  
  if (!info._lab) {
    html += `📋 Este código está en la base de referencia (sin LAB curado todavía).\n\n`;
    html += `<b>Categoría:</b> ${catLabels[info.cat] || info.cat}\n\n`;
    html += `💡 <b>Recomendación general:</b>\n`;
    html += `• Marca el Tipo Dx como D (definitivo) si tienes certeza, P si es presuntivo, R si es seguimiento\n`;
    html += `• Consulta el manual oficial del MINSA para reglas específicas del campo LAB\n`;
    html += `• Si es un código común que debería tener LAB, repórtalo al Ing. Mantilla para agregarlo`;
    return html;
  }
  
  if (info.cat === 'cesado') {
    html += `⚠️ <span style="color:#ef4444"><b>CÓDIGO CESADO</b></span>\n`;
    if (info.alternativa) {
      html += `Usa en su lugar: <b>${info.alternativa}</b>\n\n`;
    }
  }
  
  // ¿Qué va en LAB?
  if (info.labMeaning && info.labMeaning.length > 0) {
    html += `📝 <b>¿Qué va en el campo LAB?</b>\n`;
    info.labMeaning.forEach(lm => {
      html += `• <b style="color:#fbbf24">${lm.v}</b>: ${lm.d}\n`;
    });
    html += `\n`;
  }
  
  // Ejemplos
  if (info.examples && info.examples.length > 0) {
    html += `💡 <b>Ejemplos en diferentes condiciones:</b>\n\n`;
    info.examples.forEach((ex, i) => {
      html += `<b>${i+1}.</b> ${ex.contexto}\n`;
      const campos = ex.campos.map(c => `${c.l}=<b>${c.v}</b>`).join(' · ');
      html += `   <span style="font-family:monospace; color:#10b981">${campos}</span>\n\n`;
    });
  }
  
  if (info.nota) html += `📌 <b>Nota:</b> ${info.nota}\n\n`;
  if (info.extra) html += `📖 <b>Origen:</b> ${info.extra}`;
  
  return html;
}

function responderIA(pregunta) {
  agregarMensajeIA('user', pregunta);
  // Procesar pregunta
  setTimeout(() => {
    const respuesta = procesarPreguntaIA(pregunta);
    agregarMensajeIA('ai', respuesta);
  }, 600);
}

function procesarPreguntaIA(pregunta) {
  const q = normalizar(pregunta);
  
  // 1) ¿Hay un código mencionado?
  const codMatch = pregunta.match(/\b([A-Z]\d{2,4}[A-Z0-9.]{0,5}|\d{5}(?:\.\d{1,2})?)\b/i);
  if (codMatch) {
    const cod = codMatch[0].toUpperCase();
    const info = obtenerInfoCodigo(cod);
    if (info) {
      let intro = '';
      if (q.includes('lab') || q.includes('campo')) {
        intro = `Para el campo LAB del código ${cod}:\n\n`;
      } else if (q.includes('ejemplo')) {
        intro = `Aquí tienes ejemplos de uso del código ${cod}:\n\n`;
      } else if (q.includes('cuando') || q.includes('cuándo') || q.includes('usar')) {
        intro = `El código ${cod} se usa así:\n\n`;
      }
      return intro + generarRespuestaCodigo(info);
    } else {
      return `❌ No encontré el código <b>${cod}</b> en la base. Verifica que esté bien escrito o consúltame por el nombre de la patología.`;
    }
  }
  
  // 2) Búsqueda por palabras clave
  const palabrasClave = {
    'dengue': 'A970',
    'anemia': 'D509',
    'hipertension': 'I10X', 'hipertensión': 'I10X', 'presion alta': 'I10X', 'presión alta': 'I10X', 'pa alta': 'I10X',
    'diabetes': 'E119', 'azucar alta': 'E119', 'azúcar alta': 'E119',
    'asma': 'J45',
    'neumonia': 'J189', 'neumonía': 'J189',
    'diarrea': 'A099', 'eda': 'A099',
    'cred': '99381',
    'planificacion familiar': '99208', 'planificación familiar': '99208', 'pf': '99208',
    'embarazo': 'Z3490', 'gestante': 'Z3490', 'gestacion': 'Z3490', 'prenatal': 'Z3490',
    'colesterol': 'E780', 'dislipidemia': 'E785',
    'lumbago': 'M545', 'dolor de espalda': 'M545',
    'itu': 'N390', 'infeccion urinaria': 'N390', 'infección urinaria': 'N390',
    'ansiedad': 'F412', 'depresion': 'F412', 'depresión': 'F412',
    'gastritis': 'K297',
    'profam': 'C0011', 'familia': 'C0011', 'visita familiar': 'C0011',
    'covid': 'U071',
    'cefalea': 'R51X', 'dolor de cabeza': 'R51X', 'migraña': 'G43',
  };
  
  for (const [kw, codigo] of Object.entries(palabrasClave)) {
    if (q.includes(kw)) {
      const info = obtenerInfoCodigo(codigo);
      if (info) {
        return `Para <b>${kw}</b>, el código principal es:\n\n` + generarRespuestaCodigo(info);
      }
    }
  }
  
  // 3) Preguntas generales
  if (q.includes('cesado') || q.includes('cesados')) {
    const cesados = DB_LAB.filter(x => x.cat === 'cesado').slice(0, 10);
    let resp = `🚫 <b>Códigos CESADOS más comunes:</b>\n\n`;
    cesados.forEach(c => {
      resp += `• <b>${c.codigo}</b>: ${c.nombre}`;
      if (c.alternativa) resp += ` → usar <b>${c.alternativa}</b>`;
      resp += `\n`;
    });
    resp += `\nUsa el filtro "🚫 Cesados" para ver todos.`;
    return resp;
  }
  
  if (q.includes('profam') || q.includes('familias')) {
    return `👨‍👩‍👧‍👦 <b>PROFAM / APP (Familias Saludables):</b>\n\n
Códigos principales (manual Promoción de la Salud 2024):\n
• <b>C0001-C0008</b>: Reuniones y Talleres (Municipios, IE, Comunidad, Familia)\n
• <b>C0009</b>: Sesión Educativa (LAB1=N° participantes, LAB2=temática)\n
• <b>C0010</b>: Sesión Demostrativa\n
• <b>C0011</b>: Visita Familiar Integral (LAB1=N° visita, LAB2=temática)\n
• <b>C0011.01-04</b>: Visitas familiares (Riesgos, Cuidados, Daños Agudos, Crónicos)\n
• <b>C0012</b>: Grupo de Ayuda Mutua\n
• <b>C3151</b>: Capacitación a Agentes Comunitarios\n
\nUsa el filtro 👨‍👩‍👧‍👦 PROFAM/APP para verlos todos.`;
  }
  
  if (q.includes('ayuda') || q.includes('como funciona') || q.includes('cómo funciona')) {
    return `🤖 <b>Cómo te puedo ayudar:</b>\n\n
1️⃣ <b>Pregúntame por un código:</b>
   "¿Qué va en el LAB del I10X?"
   "Ejemplos del código 99208"\n
2️⃣ <b>Pregúntame por una patología:</b>
   "¿Qué código uso para diabetes?"
   "Código para anemia en niño"\n
3️⃣ <b>Pregúntame por categorías:</b>
   "¿Cuáles son los códigos PROFAM?"
   "Códigos cesados"\n
4️⃣ <b>Usa el micrófono 🎤</b> en la barra de búsqueda para todo lo anterior por voz.`;
  }
  
  // No reconocido
  return `🤔 No estoy seguro de qué buscas exactamente.\n\n
Prueba preguntando:\n
• "¿Qué va en el LAB del código <b>I10X</b>?"\n
• "Código para hipertensión"\n
• "Ejemplos del 99208"\n
• "¿Cuáles son los códigos PROFAM?"\n
\nO usa el buscador principal escribiendo el código o nombre directamente.`;
}

function agregarMensajeIA(rol, texto) {
  state.aiHistory.push({rol, texto, ts: Date.now()});
  // Limitar a últimos 50
  if (state.aiHistory.length > 50) state.aiHistory.shift();
  localStorage.setItem('mcp_ai_history', JSON.stringify(state.aiHistory));
  renderChatIA();
}

function renderChatIA() {
  const cont = document.getElementById('aiChat');
  if (!cont) return;
  cont.innerHTML = state.aiHistory.map(m => `
    <div class="msg ${m.rol}">
      <div class="msg-bubble">${m.texto.replace(/\n/g, '<br>')}</div>
    </div>
  `).join('');
  cont.scrollTop = cont.scrollHeight;
}

function enviarPreguntaIA() {
  const input = document.getElementById('aiInput');
  const pregunta = input.value.trim();
  if (!pregunta) return;
  input.value = '';
  responderIA(pregunta);
}

function limpiarHistorialIA() {
  if (confirm('¿Borrar el historial de la conversación?')) {
    state.aiHistory = [];
    localStorage.removeItem('mcp_ai_history');
    abrirSheetIA();
  }
}

// ========== NAVEGACIÓN BOTTOM ==========
function navTo(view) {
  state.view = view;
  document.querySelectorAll('.nav-item').forEach(b => 
    b.classList.toggle('active', b.dataset.view === view)
  );
  
  if (view === 'search') {
    state.filter = 'todos';
    state.query = document.getElementById('searchInput').value;
    renderFilters();
    renderResults();
    cerrarSheets();
    window.scrollTo({top:0, behavior:'smooth'});
  } else if (view === 'favorites') {
    state.filter = 'favs';
    state.page = 1;
    state.expanded.clear();
    renderFilters();
    renderResults();
    cerrarSheets();
    setTimeout(() => {
      const target = document.getElementById('searchWrap');
      if (target) window.scrollTo({top: target.offsetTop - 60, behavior:'smooth'});
    }, 100);
  } else if (view === 'ai') {
    abrirSheetIA();
  } else if (view === 'info') {
    abrirSheetInfo();
  }
}

function abrirSheetInfo() {
  document.getElementById('sheetOverlay').classList.add('show');
  setTimeout(() => document.getElementById('infoSheet').classList.add('show'), 10);
}

function cerrarSheets() {
  document.getElementById('infoSheet').classList.remove('show');
  document.getElementById('aiSheet').classList.remove('show');
  setTimeout(() => document.getElementById('sheetOverlay').classList.remove('show'), 250);
}

function cerrarSheet() {
  cerrarSheets();
  navTo('search');
}

// ========== PWA INSTALL ==========
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  setTimeout(() => {
    if (deferredPrompt && !localStorage.getItem('mcp_installed') && !localStorage.getItem('mcp_install_dismissed')) {
      document.getElementById('installBanner').classList.add('show');
    }
  }, 3000);
});

function instalarApp() {
  if (!deferredPrompt) {
    showToast('💡 Usa el menú del navegador para "Agregar a pantalla de inicio"', 'info');
    return;
  }
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choice) => {
    if (choice.outcome === 'accepted') {
      localStorage.setItem('mcp_installed', '1');
      showToast('✅ App instalada con éxito', 'success');
    }
    deferredPrompt = null;
    document.getElementById('installBanner').classList.remove('show');
  });
}

function cerrarInstall() {
  document.getElementById('installBanner').classList.remove('show');
  localStorage.setItem('mcp_install_dismissed', '1');
}

window.addEventListener('appinstalled', () => {
  localStorage.setItem('mcp_installed', '1');
  showToast('🎉 ¡App instalada!', 'success');
  document.getElementById('installBanner').classList.remove('show');
});

// ========== INICIO ==========
function init() {
  renderKPIs();
  renderFilters();
  renderResults();
  initVoz();
  
  const params = new URLSearchParams(window.location.search);
  if (params.get('filter')) setFilter(params.get('filter'));
  if (params.get('mic') === '1') setTimeout(() => activarMic('search'), 500);
  
  const input = document.getElementById('searchInput');
  if (input) {
    input.addEventListener('focus', () => {
      document.getElementById('searchBox').classList.add('focused');
    });
    input.addEventListener('blur', () => {
      document.getElementById('searchBox').classList.remove('focused');
    });
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') input.blur();
    });
  }
  
  // Service Worker (versión hosting)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  }
  
  if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
    localStorage.setItem('mcp_installed', '1');
  }
}

document.addEventListener('DOMContentLoaded', init);
