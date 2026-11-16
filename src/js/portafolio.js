const PROYECTOS = [
  { id: 'heladerias', rubro: 'Heladerías', nombre: 'Nieve', lugar: 'Heladería en Barranco', etiqueta: 'Caso real · Heladería',
    desc: 'Nieve, heladería. Su carta a pantalla completa y los pedidos directo a su WhatsApp.',
    portada: '/img/nieve-portada-tres-bolas.webp', escritorio: '/img/nieve-carta-escritorio.webp', movil: '/img/nieve-carta-movil.webp',
    enlace: 'https://nieve-web.vercel.app' },
  { id: 'restaurantes', rubro: 'Restaurantes', nombre: 'Restaurante', etiqueta: 'Diseño de muestra · Restaurante', vacio: 'Así se vería tu restaurante.', desc: 'Carta con fotos y precios, y pedidos directo a tu WhatsApp.' },
  { id: 'cafeterias', rubro: 'Cafeterías', nombre: 'Cafetería', etiqueta: 'Diseño de muestra · Cafetería', vacio: 'Así se vería tu cafetería.', desc: 'Tu carta de cafés y postres, lista para pedir desde el celular.' },
  { id: 'pastelerias', rubro: 'Pastelerías', nombre: 'Pastelería', etiqueta: 'Diseño de muestra · Pastelería', vacio: 'Así se vería tu pastelería.', desc: 'Tus tortas con foto y precio, y encargos por WhatsApp.' }
];

const FOCUSABLES = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

function tarjetaFoto(p, i) {
  return `<article class="pf-card" style="display: flex; flex-direction: column; gap: 22px">
<button type="button" data-abrir="${p.id}" aria-label="Ver ${p.nombre} en pantalla completa" style="display: block; padding: 0; border: 0; border-radius: 24px; overflow: hidden; background: #111111; cursor: zoom-in; aspect-ratio: 16 / 10; width: 100%">
<span style="position: relative; display: block; width: 100%; height: 100%; background: radial-gradient(70% 70% at 50% 60%, #FBEBD4 0%, #F2D3A8 45%, #E3AE6E 100%)">
<span aria-hidden="true" style="position: absolute; left: 6%; top: 8%; font-family: 'Sora', 'Jost', sans-serif; font-size: clamp(22px, 2.4vw, 34px); font-weight: 400; letter-spacing: -0.04em; color: #2A1A0C">nieve</span>
<img class="pf-img" src="${p.portada}" width="1460" height="700" loading="lazy" decoding="async" alt="Tres bolas de helado de ${p.nombre}" style="position: absolute; left: 8%; right: 8%; bottom: 6%; width: 84%; height: 78%; object-fit: contain; object-position: center bottom; filter: drop-shadow(0 24px 30px rgba(120,70,20,0.35))">
</span>
</button>
${textos(p, `<button class="pf-btn" type="button" data-abrir="${p.id}" style="display: inline-flex; align-items: center; gap: 10px; min-height: 48px; padding: 0 24px; border: 0; border-radius: 999px; background-color: #FFFFFF; color: #000000; font-family: inherit; font-size: 15px; font-weight: 500; cursor: pointer">Ver la web<span aria-hidden="true">↗</span></button>`)}
</article>`;
}

function tarjetaVacia(p) {
  return `<article class="pf-card" style="display: flex; flex-direction: column; gap: 22px">
<div style="display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; aspect-ratio: 16 / 10; width: 100%; padding: clamp(28px, 3vw, 44px); border-radius: 24px; background: #111111; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.12)">
<span style="display: flex; align-items: center; gap: 10px; font-size: 14px; color: #B5B0A7"><span aria-hidden="true" style="width: 8px; height: 8px; border-radius: 50%; background: #BF0603; box-shadow: 0 0 10px 2px rgba(191,6,3,0.6)"></span>Diseño de muestra</span>
<p style="margin: 0; font-family: 'Sora', 'Jost', sans-serif; font-size: clamp(30px, 3vw, 46px); font-weight: 300; line-height: 1.08; letter-spacing: -0.035em; color: #FFFFFF">${p.vacio}</p>
</div>
${textos(p, `<a href="#contacto" style="display: inline-flex; align-items: center; min-height: 48px; padding: 0 24px; border-radius: 999px; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.4); font-size: 15px; font-weight: 500">Diagnóstico gratis</a>`)}
</article>`;
}

function textos(p, accion) {
  return `<div style="display: flex; flex-direction: column; gap: 10px">
<p style="margin: 0; font-size: 13px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: #8F8A82">${p.etiqueta}</p>
<div class="pf-fila" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px 24px">
<h3 style="margin: 0; display: flex; align-items: baseline; gap: 14px; font-family: 'Sora', 'Jost', 'Helvetica Neue', Arial, sans-serif; font-size: clamp(34px, 3.2vw, 48px); font-weight: 300; line-height: 1.05; letter-spacing: -0.04em">${p.nombre}<span class="pf-flecha" aria-hidden="true" style="font-size: 0.7em; color: #BF0603">↗</span></h3>
${accion}
</div>
<p style="margin: 0; max-width: 52ch; font-size: 17px; line-height: 1.55; color: #B5B0A7">${p.desc}</p>
</div>`;
}

export function initPortafolio() {
  const chipsEl = document.getElementById('pf-chips');
  const grid = document.getElementById('pf-grid');
  const modal = document.getElementById('pf-modal');
  if (!chipsEl || !grid || !modal) return;

  const $ = (id) => document.getElementById(id);
  const mNombre = $('pf-m-nombre'), mLugar = $('pf-m-lugar'), mEnlace = $('pf-m-enlace');
  const btnPc = $('pf-m-pc'), btnCel = $('pf-m-cel'), btnCerrar = $('pf-m-cerrar');
  const imgPc = $('pf-m-img-pc'), imgCel = $('pf-m-img-cel'), marcoCel = $('pf-m-marco'), vistaPc = $('pf-m-vista-pc');
  const portadas = modal.querySelectorAll('.pf-m-img-portada');

  let rubro = 'heladerias';
  let abiertoId = null;
  let disparador = null;
  let anchoScrollbar = 0;

  // ---- Filtros (los botones se crean una vez y se actualizan en sitio)
  const chips = PROYECTOS;
  chips.forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pf-chip';
    b.textContent = c.rubro;
    b.dataset.id = c.id;
    b.style.cssText = "min-height: 52px; padding: 0 28px; border: 0; border-radius: 999px; font-family: inherit; font-size: 17px; font-weight: 400; letter-spacing: 0.01em; cursor: pointer";
    b.addEventListener('click', () => { rubro = c.id; pintarChips(); pintarTarjetas(); });
    chipsEl.appendChild(b);
  });
  function pintarChips() {
    chipsEl.querySelectorAll('.pf-chip').forEach((b) => {
      const on = b.dataset.id === rubro;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.style.backgroundColor = on ? '#FFFFFF' : 'transparent';
      b.style.color = on ? '#000000' : '#FFFFFF';
      b.style.boxShadow = 'inset 0 0 0 1px ' + (on ? '#FFFFFF' : 'rgba(255,255,255,0.3)');
    });
  }
  function pintarTarjetas() {
    const lista = PROYECTOS.filter((p) => p.id === rubro);
    grid.innerHTML = lista.map((p) => (p.escritorio ? tarjetaFoto(p) : tarjetaVacia(p))).join('');
  }
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('[data-abrir]');
    if (b) abrir(b.dataset.abrir, b);
  });

  // ---- Modal
  function vista(pc) {
    btnPc.setAttribute('aria-pressed', pc ? 'true' : 'false');
    btnCel.setAttribute('aria-pressed', pc ? 'false' : 'true');
    btnPc.style.background = pc ? '#FFFFFF' : 'transparent';
    btnPc.style.color = pc ? '#000000' : '#FFFFFF';
    btnCel.style.background = pc ? 'transparent' : '#FFFFFF';
    btnCel.style.color = pc ? '#FFFFFF' : '#000000';
    vistaPc.style.display = pc ? 'flex' : 'none';
    marcoCel.style.display = pc ? 'none' : 'flex';
  }
  function abrir(id, origen) {
    const m = PROYECTOS.find((p) => p.id === id);
    if (!m || !m.escritorio) return;
    abiertoId = id;
    disparador = origen || document.activeElement;
    modal.setAttribute('aria-label', m.nombre + ' en pantalla completa');
    mNombre.textContent = m.nombre;
    mLugar.textContent = m.lugar;
    imgPc.src = m.escritorio;
    imgPc.alt = 'Web de ' + m.nombre + ' vista en computadora';
    imgCel.src = m.movil;
    portadas.forEach((im, k) => { im.src = m.portada; im.alt = k === 0 ? 'Portada de ' + m.nombre + ': tres bolas de helado' : ''; });
    imgCel.alt = 'Web de ' + m.nombre + ' vista en celular';
    // Enlace en vivo pendiente: sin destino no se abre una pestaña vacía.
    const pendiente = !m.enlace || m.enlace === '#';
    mEnlace.href = m.enlace || '#';
    mEnlace.title = pendiente ? 'Enlace pendiente' : '';
    if (pendiente) mEnlace.removeAttribute('target'); else mEnlace.setAttribute('target', '_blank');
    vista(true);
    // Bloqueo del scroll del fondo sin salto de layout.
    anchoScrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (anchoScrollbar > 0) document.body.style.paddingRight = anchoScrollbar + 'px';
    modal.hidden = false;
    btnCerrar.focus();
  }
  function cerrar() {
    if (modal.hidden) return;
    modal.hidden = true;
    abiertoId = null;
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    if (disparador && document.contains(disparador)) disparador.focus();
    disparador = null;
  }
  btnPc.addEventListener('click', () => vista(true));
  btnCel.addEventListener('click', () => vista(false));
  btnCerrar.addEventListener('click', cerrar);
  mEnlace.addEventListener('click', (e) => { if (mEnlace.getAttribute('href') === '#') e.preventDefault(); });

  // Esc cierra; Tab queda atrapado dentro del modal.
  document.addEventListener('keydown', (e) => {
    if (modal.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); cerrar(); return; }
    if (e.key !== 'Tab') return;
    const f = Array.from(modal.querySelectorAll(FOCUSABLES)).filter((el) => !el.hidden && el.offsetParent !== null);
    if (!f.length) { e.preventDefault(); return; }
    const primero = f[0], ultimo = f[f.length - 1];
    if (!modal.contains(document.activeElement)) { e.preventDefault(); primero.focus(); }
    else if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
  });

  pintarChips();
  pintarTarjetas();
}
