// Ejecuta start/stop de un canvas según esté o no en pantalla.
export function observarVisibilidad(el, alEntrar, alSalir) {
  if (!('IntersectionObserver' in window)) {
    alEntrar();
    return () => {};
  }
  const io = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => (e.isIntersecting ? alEntrar() : alSalir()));
  }, { rootMargin: '80px 0px' });
  io.observe(el);
  return () => io.disconnect();
}

export const prefiereReducir = () =>
  !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
