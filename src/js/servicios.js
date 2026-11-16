import { observarVisibilidad, prefiereReducir } from './utils.js';

const PIEZAS = [
  { detalle: 'Tu carta con fotos y precios, a pantalla completa.' },
  { detalle: 'El cliente arma su pedido y te llega listo a tu WhatsApp.' },
  { detalle: 'Tus mesas con un código que abre tu carta al instante.' },
  { detalle: 'Que te encuentren cuando buscan en Google o le preguntan a ChatGPT.' }
];
const DETALLE_INICIAL = 'Toca cada pieza para ver qué hace por tu negocio.';

class Servicios {
  constructor() {
    this.stage = document.getElementById('sv-stage');
    this.cv = document.getElementById('sv-canvas');
    this.detalle = document.getElementById('sv-detalle');
    this.pills = Array.from(document.querySelectorAll('.sv-pill'));
    this.pieza = -1;
    this.t0 = performance.now();
    this.mouse = null;
    this.parts = [];
    this.raf = 0;
    this.reduce = prefiereReducir();
    this.tick = this.tick.bind(this);

    this.pills.forEach((b, i) => b.addEventListener('click', () => {
      this.pieza = this.pieza === i ? -1 : i;
      this.pintarEstado();
    }));
    this.stage.addEventListener('pointermove', (e) => { if (!this.box) return; this.mouse = { x: e.clientX - this.box.left, y: e.clientY - this.box.top }; });
    this.stage.addEventListener('pointerleave', () => { this.mouse = null; });

    this.quitarObs = observarVisibilidad(this.stage, () => this.arrancar(), () => this.parar());
    window.addEventListener('pagehide', () => this.destroy());
  }
  pintarEstado() {
    this.pills.forEach((b, i) => b.setAttribute('aria-pressed', i === this.pieza ? 'true' : 'false'));
    this.detalle.textContent = this.pieza >= 0 ? PIEZAS[this.pieza].detalle : DETALLE_INICIAL;
  }
  arrancar() { if (!this.raf) this.raf = requestAnimationFrame(this.tick); }
  parar() { if (this.raf) { cancelAnimationFrame(this.raf); this.raf = 0; } }
  destroy() { this.parar(); this.quitarObs(); }
  preparar(w) {
    const N = w < 560 ? 1800 : 3600;
    const oro = Math.PI * (3 - Math.sqrt(5));
    const tonos = ['191,6,3', '191,6,3', '214,40,12', '232,90,50', '160,10,6', '255,150,110'];
    this.parts = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - 2 * (i + 0.5) / N, r = Math.sqrt(1 - y * y), th = i * oro;
      const k = Math.pow(Math.random(), 0.35);
      this.parts.push({ ux: Math.cos(th) * r * k, uy: y * k, uz: Math.sin(th) * r * k, c: tonos[(Math.random() * tonos.length) | 0],
        s: Math.random() < 0.08 ? 2.2 : 0.8 + Math.random() * 1.1, f: Math.random() * Math.PI * 2, ox: 0, oy: 0 });
    }
  }
  tick(now) {
    this.raf = requestAnimationFrame(this.tick);
    const cv = this.cv; if (!cv) return;
    const box = cv.getBoundingClientRect(); if (!box.width || !box.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.round(box.width * dpr), H = Math.round(box.height * dpr);
    if (cv.width !== W || cv.height !== H || !this.parts.length) { cv.width = W; cv.height = H; this.preparar(box.width); }
    this.box = box;
    const t = this.reduce ? 0 : (now - this.t0) / 1000;
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, box.width, box.height);
    const cx = box.width / 2, cy = box.height / 2, R = Math.min(box.width * 0.3, box.height * 0.4);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.05);
    g.addColorStop(0, 'rgba(255,170,120,0.55)'); g.addColorStop(0.45, 'rgba(255,200,170,0.28)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.05, 0, Math.PI * 2); ctx.fill();
    const a = t * 0.18, ca = Math.cos(a), sa = Math.sin(a), ti = 0.35, ci = Math.cos(ti), si = Math.sin(ti);
    const pulso = this.pieza >= 0 ? 1.06 : 1;
    this.esc = (this.esc || 1) + (pulso - (this.esc || 1)) * 0.06;
    const m = this.mouse;
    for (let i = 0; i < this.parts.length; i++) {
      const p = this.parts[i];
      const n = 1 + 0.09 * Math.sin(p.uy * 3.1 + t * 0.9) + 0.07 * Math.sin(p.ux * 4.3 - t * 0.7) + 0.05 * Math.sin(p.uz * 5.2 + t * 1.3);
      const x0 = p.ux * n, y0 = p.uy * n, z0 = p.uz * n;
      const x1 = x0 * ca - z0 * sa, z1 = x0 * sa + z0 * ca;
      const y2 = y0 * ci - z1 * si, z2 = y0 * si + z1 * ci;
      const per = 1 + z2 * 0.18;
      let px = cx + x1 * R * per * this.esc, py = cy + y2 * R * per * this.esc;
      if (m && !this.reduce) {
        const dx = px + p.ox - m.x, dy = py + p.oy - m.y, d2 = dx * dx + dy * dy;
        if (d2 < 9000 && d2 > 1) { const d = Math.sqrt(d2), k = (9000 - d2) / 9000 * 3; p.ox += dx / d * k; p.oy += dy / d * k; }
      }
      p.ox *= 0.92; p.oy *= 0.92;
      px += p.ox; py += p.oy;
      const prof = (z2 + 1) / 2;
      const al = (0.18 + 0.72 * prof) * (0.75 + 0.25 * Math.sin(p.f + t * 2.4));
      const q = p.s * (0.6 + prof * 0.7);
      ctx.fillStyle = 'rgba(' + p.c + ',' + al.toFixed(3) + ')';
      ctx.fillRect(px - q / 2, py - q / 2, q, q);
    }
  }
}

export function initServicios() {
  if (!document.getElementById('sv-stage')) return null;
  return new Servicios();
}
