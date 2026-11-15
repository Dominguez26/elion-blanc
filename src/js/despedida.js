// "Despedida" roja: cuando el final de una sección blanca llega a una distancia
// fija de la barra de navegación, el rojo se despliega en forma circular desde
// el centro y tapa lo que queda visible de la sección. Al volver hacia arriba,
// el círculo se recoge.
import { prefiereReducir } from './utils.js';

const SECCIONES = ['quienes-somos', 'preguntas', 'fundador'];
const DISTANCIA = 48; // px entre la barra y el final de la sección para disparar el rojo

export function initDespedida() {
  if (prefiereReducir()) return;
  const items = SECCIONES.map((id) => document.getElementById(id)).filter(Boolean).map((sec) => {
    sec.classList.add('despedida');
    const banda = document.createElement('div');
    banda.className = 'despedida-banda';
    banda.setAttribute('aria-hidden', 'true');
    sec.appendChild(banda);
    return { sec, banda, activa: false, alto: -1 };
  });
  if (!items.length) return;

  let pendiente = false;
  const actualizar = () => {
    pendiente = false;
    const nav = document.getElementById('hero-header');
    const navBottom = nav ? nav.getBoundingClientRect().bottom : 90;
    for (const it of items) {
      const r = it.sec.getBoundingClientRect();
      const activa = r.bottom <= navBottom + DISTANCIA;
      // La banda cubre la parte visible de la sección (más un margen bajo la barra).
      const alto = Math.round(Math.max(0, Math.min(r.height, r.bottom)) + 24);
      if (alto !== it.alto) { it.banda.style.height = alto + 'px'; it.alto = alto; }
      if (activa !== it.activa) { it.banda.classList.toggle('activa', activa); it.activa = activa; }
    }
  };
  const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); } };
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  actualizar();
}
