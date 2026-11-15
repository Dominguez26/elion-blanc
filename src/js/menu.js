// Menú hamburguesa para celular y tablet (≤ 900px).
export function initMenu() {
  const boton = document.querySelector('.hp-burger');
  const menu = document.getElementById('menu-movil');
  if (!boton || !menu) return;
  const cerrarBtn = menu.querySelector('.mm-x');
  const FOCO = 'a[href], button:not([disabled])';

  const abrir = () => {
    menu.hidden = false;
    document.body.classList.add('mm-abierto');
    boton.setAttribute('aria-expanded', 'true');
    cerrarBtn.focus();
  };
  const cerrar = (devolverFoco = true) => {
    menu.hidden = true;
    document.body.classList.remove('mm-abierto');
    boton.setAttribute('aria-expanded', 'false');
    if (devolverFoco) boton.focus();
  };

  boton.addEventListener('click', abrir);
  cerrarBtn.addEventListener('click', () => cerrar());
  menu.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', () => cerrar(false)));
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { cerrar(); return; }
    if (e.key !== 'Tab') return;
    const f = [...menu.querySelectorAll(FOCO)];
    const primero = f[0], ultimo = f[f.length - 1];
    if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
  });
  // Si la pantalla se agranda con el menú abierto, se cierra solo.
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches && !menu.hidden) cerrar(false); });
}

// En teléfonos la barra no tiene fondo: el logo y las rayas cambian a negro
// cuando pasan sobre una sección clara, y a blanco sobre las oscuras o el rojo.
export function initColorBarra() {
  const barra = document.getElementById('hero-header');
  if (!barra) return;
  const fondo = document.createElement('div');
  fondo.className = 'barra-fondo';
  fondo.setAttribute('aria-hidden', 'true');
  document.body.appendChild(fondo);
  const claras = ['quienes-somos', 'servicios', 'preguntas', 'contacto', 'fundador']
    .map((id) => document.getElementById(id)).filter(Boolean);
  let pendiente = false;
  const actualizar = () => {
    pendiente = false;
    const y = barra.getBoundingClientRect().top + barra.offsetHeight / 2;
    const sec = claras.find((s) => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom >= y; });
    const roja = sec && sec.querySelector('.despedida-banda.activa');
    barra.classList.toggle('sobre-claro', !!sec && !roja);
  };
  const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); } };
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  // El rojo de despedida aparece con una transición; se vuelve a revisar al terminar.
  document.addEventListener('transitionend', pedir);
  actualizar();
}
