import { observarVisibilidad, prefiereReducir } from './utils.js';

const DATOS = [
  { estado: 'El punto de partida: lo que hoy está desordenado.' },
  { estado: 'Ponemos orden: un plan claro para tu negocio.' },
  { estado: 'Tu ecosistema, completo y en movimiento.' }
];

class Proceso {
  constructor() {
    this.stage = document.getElementById('pr-stage');
    this.cv = document.getElementById('pr-canvas');
    this.estado = document.getElementById('pr-estado');
    this.contador = document.getElementById('pr-contador');
    this.botones = Array.from(document.querySelectorAll('.pr-paso'));
    this.paso = 0;
    this.manual = false;
    this.t0 = performance.now();
    this.cambio = 0;
    this.parts = [];
    this.mouse = null;
    this.raf = 0;
    this.pausadoEn = 0;
    this.reduce = prefiereReducir();
    this.tonos = ['191,6,3', '191,6,3', '191,6,3', '226,52,22', '255,110,70', '255,214,190'];
    this.tick = this.tick.bind(this);

    this.botones.forEach((b, i) => b.addEventListener('click', () => {
      this.paso = i;
      this.manual = true;
      this.pintarEstado();
    }));
    this.stage.addEventListener('pointermove', (e) => { if (!this.box) return; this.mouse = { x: e.clientX - this.box.left, y: e.clientY - this.box.top }; });
    this.stage.addEventListener('pointerleave', () => { this.mouse = null; });

    this.pintarEstado();
    this.quitarObs = observarVisibilidad(this.stage, () => this.arrancar(), () => this.parar());
    window.addEventListener('pagehide', () => this.destroy());
  }
  arrancar() {
    if (this.raf) return;
    if (this.pausadoEn) {
      // Descuenta el tiempo en pausa para que la animación no salte.
      this.t0 += performance.now() - this.pausadoEn;
      this.pausadoEn = 0;
    }
    // Al volver a pantalla, el paso activo reinicia su temporizador de 6 s y su barra.
    this.autoDesde = null;
    this.reiniciarBarra();
    this.raf = requestAnimationFrame(this.tick);
  }
  parar() {
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = 0; this.pausadoEn = performance.now(); }
  }
  destroy() { this.parar(); this.quitarObs(); }
  // Reinicia la barra roja del paso activo (animación CSS de 6 s).
  reiniciarBarra() {
    if (this.manual || this.reduce) return;
    const barra = this.botones[this.paso].querySelector('.pr-barra');
    barra.classList.remove('pr-corre');
    void barra.offsetWidth;
    barra.classList.add('pr-corre');
  }
  pintarEstado() {
    const { paso, manual } = this;
    this.estado.textContent = DATOS[paso].estado;
    this.contador.textContent = '0' + (paso + 1) + ' / 03';
    this.botones.forEach((b, i) => {
      const on = i === paso;
      const corriendo = on && !manual;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.querySelector('.pr-num').style.color = on ? '#E0261F' : '#8F8A82';
      b.querySelector('.pr-tit').style.color = on ? '#FFFFFF' : '#6F6A63';
      const desc = b.querySelector('.pr-desc');
      if (desc.hidden !== !on) {
        desc.hidden = !on;
        if (on) { desc.style.animation = 'none'; void desc.offsetWidth; desc.style.animation = ''; }
      }
      const barra = b.querySelector('.pr-barra');
      barra.classList.remove('pr-corre');
      void barra.offsetWidth;
      if (corriendo) { barra.style.transform = 'scaleX(0)'; barra.classList.add('pr-corre'); }
      else barra.style.transform = 'scaleX(' + (i < paso || (on && manual) ? '1' : '0') + ')';
    });
  }
  preparar(w, h) {
    const N = w < 560 ? 1600 : 3000;
    const cols = w < 560 ? 34 : 64, filas = w < 560 ? 14 : 18;
    const gw = Math.min(w * 0.78, 760), gh = Math.min(h * 0.56, 320);
    const oro = Math.PI * (3 - Math.sqrt(5));
    this.parts = [];
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random());
      const ci = i % (cols * filas), gx = ci % cols, gy = (ci / cols) | 0;
      const y = 1 - 2 * (i + 0.5) / N, rr = Math.sqrt(1 - y * y), th = i * oro;
      this.parts.push({
        x: w / 2 + (Math.random() - 0.5) * w, y: h + 20 + Math.random() * 60, vx: 0, vy: 0,
        caosX: Math.cos(a) * r * w * 0.4, caosY: Math.sin(a) * r * h * 0.36,
        gridX: (gx / (cols - 1) - 0.5) * gw, gridY: (gy / (filas - 1) - 0.5) * gh + (i >= cols * filas ? (Math.random() - 0.5) * 2 : 0),
        ux: Math.cos(th) * rr, uy: y, uz: Math.sin(th) * rr,
        c: this.tonos[(Math.random() * this.tonos.length) | 0], r: Math.random() < 0.1 ? 1.6 : 0.5 + Math.random() * 0.9, fase: Math.random() * Math.PI * 2
      });
    }
  }
  tick(now) {
    this.raf = requestAnimationFrame(this.tick);
    const cv = this.cv;
    if (!cv) return;
    const box = cv.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.round(box.width * dpr), H = Math.round(box.height * dpr);
    if (cv.width !== W || cv.height !== H || !this.parts.length) { cv.width = W; cv.height = H; this.preparar(box.width, box.height); }
    this.box = box;
    const t = (now - this.t0) / 1000;
    const paso = this.paso;
    if (this.autoDesde == null) this.autoDesde = t;
    if (this.visto !== paso) { this.visto = paso; this.cambio = t; this.autoDesde = t; this.parts.forEach((p) => { const a = Math.random() * Math.PI * 2, f = paso === 0 ? 4 : 2; p.vx += Math.cos(a) * f; p.vy += Math.sin(a) * f; }); }
    if (!this.manual && !this.reduce && t - this.autoDesde > 6) {
      this.paso = (paso + 1) % 3;
      this.pintarEstado();
    }
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, box.width, box.height);
    ctx.globalCompositeOperation = 'lighter';
    const cx = box.width / 2, cy = box.height * 0.47, R = Math.min(box.width, box.height) * 0.34;
    const ang = t * 0.35, ca = Math.cos(ang), sa = Math.sin(ang), ci = Math.cos(0.41), si = Math.sin(0.41);
    const local = t - this.cambio, m = this.mouse;
    for (let i = 0; i < this.parts.length; i++) {
      const p = this.parts[i];
      let tx, ty, prof = 1, brillo = 1;
      if (paso === 0) {
        tx = cx + p.caosX + Math.sin(p.fase * 3 + now * 0.0021) * 26 + Math.sin(now * 0.0007 + p.fase) * 14;
        ty = cy + p.caosY + Math.cos(p.fase * 2 + now * 0.0019) * 22;
        brillo = 0.55;
      } else if (paso === 1) {
        tx = cx + p.gridX; ty = cy + p.gridY;
        brillo = 0.8;
      } else {
        const x1 = p.ux * ca - p.uz * sa, z1 = p.ux * sa + p.uz * ca;
        const x2 = x1 * ci - p.uy * si, y2 = x1 * si + p.uy * ci;
        const s = 1 + z1 * 0.12;
        tx = cx + x2 * R * s; ty = cy + y2 * R * s; prof = (z1 + 1) / 2; brillo = 0.25 + 0.95 * prof;
      }
      if (this.reduce) { p.x = tx; p.y = ty; }
      else {
        const f = Math.min(paso === 0 ? 0.05 : 0.1, 0.008 + local * 0.05);
        p.vx += (tx - p.x) * f; p.vy += (ty - p.y) * f;
        if (m) { const dx = p.x - m.x, dy = p.y - m.y, d2 = dx * dx + dy * dy; if (d2 < 8000 && d2 > 1) { const d = Math.sqrt(d2), k = (8000 - d2) / 8000 * 2.4; p.vx += dx / d * k; p.vy += dy / d * k; } }
        p.vx *= paso === 0 ? 0.88 : 0.8; p.vy *= paso === 0 ? 0.88 : 0.8; p.x += p.vx; p.y += p.vy;
      }
      const a = brillo * (0.6 + 0.4 * Math.sin(p.fase + now * 0.004));
      const q = p.r * (paso === 2 ? 0.7 + prof * 0.8 : 1) * 1.5;
      ctx.fillStyle = 'rgba(' + p.c + ',' + Math.min(1, a).toFixed(3) + ')';
      ctx.fillRect(p.x - q / 2, p.y - q / 2, q, q);
    }
  }
}

export function initProceso() {
  if (!document.getElementById('pr-stage')) return null;
  return new Proceso();
}
