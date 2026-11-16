import { observarVisibilidad, prefiereReducir } from './utils.js';

// Ajustes del diseño (valores `default` de data-props).
const PROPS = { intensidad: 1.4, giro: 60 };

class Hero {
  constructor(seccion) {
    this.seccion = seccion;
    this.cv = seccion.querySelector('#hero-canvas');
    this.header = seccion.querySelector('#hero-header');
    this.titulo = seccion.querySelector('#hero-title');
    this.btn = seccion.querySelector('#hero-btn');
    this.props = PROPS;
    this.t0 = performance.now();
    this.texto = [];
    this.esfera = [];
    this.mouse = null;
    this.raf = 0;
    this.reduce = prefiereReducir();
    this.tonos = ['191,6,3', '191,6,3', '191,6,3', '226,52,22', '255,110,70', '255,214,190'];
    const sp = document.createElement('canvas');
    sp.width = sp.height = 32;
    const sc = sp.getContext('2d');
    const g = sc.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,200,170,1)');
    g.addColorStop(0.25, 'rgba(226,52,22,0.6)');
    g.addColorStop(1, 'rgba(191,6,3,0)');
    sc.fillStyle = g;
    sc.fillRect(0, 0, 32, 32);
    this.sprite = sp;
    this.tick = this.tick.bind(this);

    // Los eventos que el navegador genera solo por el scroll (sin mover el mouse) se ignoran,
    // para que la esfera no se abolle al volver al hero.
    this.onMove = (e) => { if (!this.box) return; if (e.pointerType === 'mouse' && !e.movementX && !e.movementY) return; this.mouse = { x: e.clientX - this.box.left, y: e.clientY - this.box.top }; };
    this.onLeave = () => { this.mouse = null; };
    seccion.addEventListener('pointermove', this.onMove);
    seccion.addEventListener('pointerleave', this.onLeave);
    // Al hacer scroll la posición guardada del mouse queda desfasada; se descarta.
    this.onScroll = () => { this.mouse = null; };
    window.addEventListener('scroll', this.onScroll, { passive: true });

    this.quitarObs = observarVisibilidad(seccion, () => { this.visible = true; this.arrancar(); }, () => { this.visible = false; this.parar(); });
    // Pestaña oculta: se pausa el reloj igual que al salir del hero.
    this.onVis = () => { if (document.hidden) this.parar(); else if (this.visible) this.arrancar(); };
    document.addEventListener('visibilitychange', this.onVis);
    this.onHide = () => this.destroy();
    window.addEventListener('pagehide', this.onHide);
  }
  arrancar() {
    // Al volver al hero, el reloj continúa desde donde se pausó: así la esfera
    // no "salta" de golpe a otra posición y no se deforma mientras se reacomoda.
    if (document.hidden) return;
    if (this.pausa) { this.t0 += performance.now() - this.pausa; this.pausa = 0; }
    this.ultimo = 0;
    this.mouse = null;
    if (!this.raf) this.raf = requestAnimationFrame(this.tick);
  }
  parar() {
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = 0; this.pausa = performance.now(); }
  }
  destroy() {
    this.parar();
    this.quitarObs();
    this.seccion.removeEventListener('pointermove', this.onMove);
    this.seccion.removeEventListener('pointerleave', this.onLeave);
    window.removeEventListener('pagehide', this.onHide);
    document.removeEventListener('visibilitychange', this.onVis);
    window.removeEventListener('scroll', this.onScroll);
  }
  medir() {
    const cv = this.cv;
    if (!cv) return false;
    const box = cv.getBoundingClientRect();
    if (!box.width || !box.height) return false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.round(box.width * dpr), H = Math.round(box.height * dpr);
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    this.w = box.width; this.h = box.height; this.dpr = dpr; this.box = box;
    this.movil = this.w < 900;
    this.hilos = this.movil ? 6 : 9;
    this.tablet = this.movil && this.w >= 600;
    this.R = this.tablet ? Math.min(this.w * 0.36, 290) : (this.movil ? this.w * 0.5 : Math.min(this.w * 0.29, this.h * 0.47));
    this.cx = this.movil ? this.w * 0.68 : Math.min(this.w * 0.79, this.w - this.R * 1.04);
    this.cy = this.tablet ? Math.min(this.R + 110, this.h * 0.36) : (this.movil ? Math.min(230, this.h * 0.28) : this.h * 0.5);
    // Teléfonos (< 768 px): el hero mide una pantalla, así que la esfera se hace más compacta
    // y sube, para que el texto y el botón entren sin hacer scroll.
    if (this.w < 768) { this.R = Math.min(this.w * 0.42, this.h * 0.27); this.cy = this.h * 0.25; }
    this.ox = this.w * 0.5;
    this.oy = this.h + 20;
    return true;
  }
  gauss() {
    return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
  }
  rangoLetras(el, ctx, cs) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    let n;
    ctx.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
    ctx.textBaseline = 'middle';
    const upper = cs.textTransform === 'uppercase';
    while ((n = walker.nextNode())) {
      const txt = n.textContent;
      for (let i = 0; i < txt.length; i++) {
        const ch = txt[i];
        if (ch === ' ' || ch === '\n') continue;
        range.setStart(n, i); range.setEnd(n, i + 1);
        const r = range.getBoundingClientRect();
        if (!r.width) continue;
        ctx.fillText(upper ? ch.toUpperCase() : ch, r.left - this.box.left, r.top - this.box.top + r.height / 2);
      }
    }
  }
  muestrear() {
    const w = Math.ceil(this.w), h = Math.ceil(this.h);
    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    const ctx = off.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#FFFFFF';
    [this.header, this.titulo, this.btn].forEach((el) => { if (el) this.rangoLetras(el, ctx, getComputedStyle(el)); });
    if (this.btn) {
      const r = this.btn.getBoundingClientRect();
      const x = r.left - this.box.left, y = r.top - this.box.top;
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x + 1, y + 1, r.width - 2, r.height - 2, r.height / 2); else ctx.rect(x + 1, y + 1, r.width - 2, r.height - 2);
      ctx.stroke();
    }
    const data = ctx.getImageData(0, 0, w, h).data;
    const paso = this.movil ? 3 : 2;
    const pts = [];
    for (let y = 0; y < h; y += paso) {
      for (let x = 0; x < w; x += paso) {
        if (data[(y * w + x) * 4 + 3] > 110) pts.push([x + (Math.random() - 0.5), y + (Math.random() - 0.5)]);
      }
    }
    const max = this.movil ? 2400 : 6000;
    while (pts.length > max) pts.splice((Math.random() * pts.length) | 0, 1);
    return pts;
  }
  salida(p) {
    p.x = this.ox + this.gauss() * 24;
    p.y = this.oy + Math.random() * 60;
    p.vx = 0; p.vy = -(6 + Math.random() * 5);
    p.hebra = Math.random() * Math.PI * 2;
    p.amp = 30 + Math.random() * 90;
    p.vida = 0;
  }
  base() {
    return {
      r: Math.random() < 0.12 ? 1.2 + Math.random() * 1.5 : 0.5 + Math.random() * 0.9,
      c: this.tonos[(Math.random() * this.tonos.length) | 0],
      fase: Math.random() * Math.PI * 2,
      brillo: Math.random() < 0.04
    };
  }
  crearEsfera() {
    const N = Math.round((this.movil ? 2600 : 7200) * Math.min(1.6, this.props.intensidad ?? 1.4) / 1.4);
    const oro = Math.PI * (3 - Math.sqrt(5));
    const lista = [];
    for (let i = 0; i < N; i++) {
      const p = this.base();
      let y = 1 - 2 * (i + 0.5) / N;
      if (Math.random() < 0.1) y = Math.sign(y || 1) * (0.86 + Math.random() * 0.14);
      const rr = Math.sqrt(Math.max(0, 1 - y * y));
      const th = i * oro + this.gauss() * 0.04;
      p.ux = Math.cos(th) * rr; p.uy = y; p.uz = Math.sin(th) * rr;
      p.rf = Math.random() < 0.22 ? 0.55 + Math.sqrt(Math.random()) * 0.43 : 1 + this.gauss() * 0.03;
      this.salida(p);
      p.s = 0.92 + Math.random() * 0.08; p.k = (Math.random() * this.hebras.length) | 0;
      p.retraso = 9.8 + Math.random() * 2.4;
      lista.push(p);
    }
    this.esfera = lista;
    const sup = lista.filter((p) => p.rf > 0.95);
    const muestra = sup.filter(() => Math.random() < (this.movil ? 0.12 : 0.16));
    const pares = [];
    for (let i = 0; i < muestra.length; i++) {
      let mejor = [];
      for (let j = 0; j < muestra.length; j++) {
        if (i === j) continue;
        const a = muestra[i], b = muestra[j];
        const d = (a.ux - b.ux) * (a.ux - b.ux) + (a.uy - b.uy) * (a.uy - b.uy) + (a.uz - b.uz) * (a.uz - b.uz);
        if (d < 0.02) mejor.push([d, b]);
      }
      mejor.sort((x, y) => x[0] - y[0]);
      mejor.slice(0, 2).forEach((m) => pares.push([muestra[i], m[1], Math.random() * Math.PI * 2]));
    }
    this.pares = pares;
  }
  crearTexto() {
    this.texto = this.muestrear().map((t) => {
      const p = this.base();
      this.salida(p);
      p.tx = t[0]; p.ty = t[1];
      p.s = 0.3 + Math.random() * 0.6; p.k = this.tempranas[(Math.random() * this.tempranas.length) | 0];
      p.retraso = 2.4 + Math.random() * 1.6;
      return p;
    });
  }
  prepararHilos() {
    const n = this.movil ? 42 : 72;
    const tonos = ['191,6,3', '226,52,22', '226,52,22', '255,140,100', '216,211,203'];
    this.hebras = [];
    for (let i = 0; i < n; i++) {
      const c = tonos[(Math.random() * tonos.length) | 0];
      const palido = c === '216,211,203';
      this.hebras.push({
        fi: Math.random() * Math.PI * 2,
        vueltas: 0.8 + Math.random() * 2.4,
        H: this.h * (0.5 + Math.random() * 0.5),
        rmax: (this.movil ? 0.22 : 0.3) * this.w * (0.35 + Math.random() * 0.65),
        rmin: 4 + Math.random() * 10,
        vaiven: 20 + Math.random() * 70,
        retraso: Math.pow(Math.random(), 1.4) * 4.5,
        dur: 2.6 + Math.random() * 1.6,
        c, alfa: palido ? 0.22 + Math.random() * 0.18 : 0.35 + Math.random() * 0.45,
        ancho: (palido ? 0.45 : 0.55 + Math.random() * 0.55) * (this.movil ? 0.85 : 1),
        cuentas: Math.random() < 0.3 ? [Math.random(), Math.random()] : [],
        vel: 0.05 + Math.random() * 0.08
      });
    }
    this.tempranas = this.hebras.map((h, i) => i).filter((i) => this.hebras[i].retraso < 1.4);
    if (!this.tempranas.length) this.tempranas = [0];
  }
  crecido(h, t) {
    const u = Math.min(1, Math.max(0, (t - 0.2 - h.retraso) / h.dur));
    return 1 - Math.pow(1 - u, 3);
  }
  hilo(k, sv, t) {
    const h = this.hebras[k];
    const bx = this.movil ? this.cx : this.cx - this.R * 0.25, by = this.h + 12;
    const r = h.rmin + h.rmax * Math.pow(sv, 1.3);
    const th = h.fi + h.vueltas * Math.PI * 2 * Math.sqrt(sv) + t * 0.22;
    let x = bx + r * Math.cos(th) + Math.sin(sv * 2.6 + t * 0.5 + h.fi) * sv * sv * h.vaiven;
    let y = by - sv * h.H + r * Math.sin(th) * 0.28;
    const k2 = Math.min(1, Math.max(0, (t - 8.4) / 2));
    if (k2 > 0) {
      const e = k2 * k2 * (3 - 2 * k2) * sv;
      x += (this.cx + (x - this.cx) * 0.3 - x) * e;
      y += (this.cy + (y - this.cy) * 0.3 - y) * e;
    }
    return { x, y, z: Math.sin(th) };
  }
  dibujarCuerda(ctx, t, now) {
    if (this.reduce || !this.hebras) return;
    const fade = t < 10.4 ? 1 : Math.max(0, 1 - (t - 10.4) / 2.2);
    if (fade <= 0) return;
    const pasos = 90;
    for (let k = 0; k < this.hebras.length; k++) {
      const h = this.hebras[k];
      const g = this.crecido(h, t);
      if (g <= 0.01) continue;
      const fin = Math.max(2, Math.round(pasos * g));
      ctx.lineWidth = h.ancho;
      const tramos = 5, porTramo = Math.ceil(fin / tramos);
      for (let tr = 0; tr < tramos; tr++) {
        const i0 = tr * porTramo, i1 = Math.min(fin, i0 + porTramo);
        if (i1 <= i0) break;
        const sm = ((i0 + i1) / 2) / pasos;
        const punta = 1 - Math.pow(sm / Math.max(g, 0.01), 4) * 0.55;
        const a = fade * h.alfa * Math.min(1, sm * 6 + 0.15) * punta;
        ctx.strokeStyle = 'rgba(' + h.c + ',' + a.toFixed(3) + ')';
        ctx.beginPath();
        let q = this.hilo(k, i0 / pasos, t); ctx.moveTo(q.x, q.y);
        for (let i = i0 + 1; i <= i1; i++) { q = this.hilo(k, i / pasos, t); ctx.lineTo(q.x, q.y); }
        ctx.stroke();
      }
      for (let j = 0; j < h.cuentas.length; j++) {
        const sb = ((t * h.vel + h.cuentas[j]) % 1) * g;
        const q = this.hilo(k, sb, t), s2 = 9;
        ctx.globalAlpha = 0.85 * fade;
        ctx.drawImage(this.sprite, q.x - s2 / 2, q.y - s2 / 2, s2, s2);
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(255,214,190,' + (0.9 * fade).toFixed(3) + ')';
        ctx.fillRect(q.x - 0.9, q.y - 0.9, 1.8, 1.8);
      }
    }
  }
  ascenso(p, t, now) {
    if (!this.hebras) return;
    const h = this.hebras[p.k];
    const q = this.hilo(p.k, p.s * Math.max(0.05, this.crecido(h, t)), t);
    p.x = q.x; p.y = q.y; p.vx = 0; p.vy = 0;
  }
  atraer(p, tx, ty, local) {
    const f = Math.min(0.12, 0.01 + local * 0.05);
    p.vx += (tx - p.x) * f;
    p.vy += (ty - p.y) * f;
    p.vx *= 0.8; p.vy *= 0.8;
    if (this.mouse) {
      const dx = p.x - this.mouse.x, dy = p.y - this.mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 9000 && d2 > 1) { const d = Math.sqrt(d2), k = (9000 - d2) / 9000 * 2.4; p.vx += dx / d * k; p.vy += dy / d * k; }
    }
    p.x += p.vx; p.y += p.vy;
  }
  pintar(ctx, p, a, tam, now) {
    if (a <= 0.01) return;
    if (p.brillo || p.r > 1.3) {
      const s = p.r * tam * (p.brillo ? 9 + 3 * Math.sin(p.fase + now * 0.006) : 5);
      ctx.globalAlpha = Math.min(1, a * (p.brillo ? 0.9 : 0.45));
      ctx.drawImage(this.sprite, p.x - s / 2, p.y - s / 2, s, s);
      ctx.globalAlpha = 1;
    }
    const q = p.r * tam * 1.4;
    ctx.fillStyle = 'rgba(' + p.c + ',' + Math.min(1, a).toFixed(3) + ')';
    ctx.fillRect(p.x - q / 2, p.y - q / 2, q, q);
  }
  tick(now) {
    this.raf = requestAnimationFrame(this.tick);
    // Si el navegador congeló la animación (pestaña en segundo plano, bloqueo), el reloj
    // no avanza ese tiempo: así la esfera no salta ni se deforma al reacomodarse.
    if (this.ultimo && now - this.ultimo > 100) this.t0 += now - this.ultimo - 16;
    this.ultimo = now;
    if (!this.medir()) return;
    const ctx = this.cv.getContext('2d');
    const t = (now - this.t0) / 1000;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.globalCompositeOperation = 'lighter';
    if (!this.lista && ((t > 0.15 && document.fonts && document.fonts.status === 'loaded') || t > 1)) {
      this.lista = true;
      this.prepararHilos();
      this.crearEsfera();
      if (!this.reduce) this.crearTexto();
    }
    const vuelta = Math.max(20, this.props.giro ?? 60);
    const m = this.mouse;
    const objX = m && !this.movil ? (m.x - this.cx) / this.w * 0.7 : 0;
    const objY = m && !this.movil ? (m.y - this.cy) / this.h * 0.45 : 0;
    this.incX = (this.incX || 0) + (objX - (this.incX || 0)) * 0.04;
    this.incY = (this.incY || 0) + (objY - (this.incY || 0)) * 0.04;
    const ang = this.reduce ? 0.6 : 0.6 + (t / vuelta) * Math.PI * 2 + this.incX;
    const ca = Math.cos(ang), sa = Math.sin(ang);
    const inc = 0.41 + this.incY, ci = Math.cos(inc), si = Math.sin(inc);
    const resp = this.reduce ? 1 : 1 + 0.025 * Math.sin(t * Math.PI * 2 / 9);
    const R = this.R * resp;
    this.dibujarCuerda(ctx, t, now);
    if (t > 9.6) {
      const fuerzaHalo = Math.min(1, (t - 9.6) / 2.5);
      const hg = ctx.createRadialGradient(this.cx, this.cy, R * 0.2, this.cx, this.cy, R * 1.55);
      hg.addColorStop(0, 'rgba(191,6,3,' + (0.11 * fuerzaHalo * resp).toFixed(3) + ')');
      hg.addColorStop(0.55, 'rgba(191,6,3,' + (0.05 * fuerzaHalo).toFixed(3) + ')');
      hg.addColorStop(1, 'rgba(191,6,3,0)');
      ctx.fillStyle = hg;
      ctx.fillRect(this.cx - R * 1.6, this.cy - R * 1.6, R * 3.2, R * 3.2);
    }
    if (!this.reduce && t > 12.5) {
      const n = this.movil ? 1 : 3;
      for (let k = 0; k < n; k++) {
        if (Math.random() < 0.5) {
          const p = this.esfera[(Math.random() * this.esfera.length) | 0];
          if (p && !p.viento) { p.viento = t; p.vdur = 2.5 + Math.random() * 3; p.vamp = 0.15 + Math.random() * 0.45; }
        }
      }
    }
    for (let i = 0; i < this.esfera.length; i++) {
      const p = this.esfera[i];
      let rf = p.rf;
      if (p.viento) {
        const u = (t - p.viento) / p.vdur;
        if (u >= 1) p.viento = 0; else rf = p.rf * (1 + Math.sin(u * Math.PI) * p.vamp);
      }
      const x1 = p.ux * ca - p.uz * sa;
      const z1 = p.ux * sa + p.uz * ca;
      const x2 = x1 * ci - p.uy * si;
      const y2 = x1 * si + p.uy * ci;
      const persp = 1 + z1 * 0.12;
      const tx = this.cx + x2 * R * rf * persp;
      const ty = this.cy + y2 * R * rf * persp;
      const prof = (z1 + 1) / 2;
      p.prof = prof;
      const local = t - p.retraso;
      if (this.reduce) { p.x = tx; p.y = ty; }
      else if (local < 0) this.ascenso(p, t, now);
      else this.atraer(p, tx, ty, local);
      const luz = Math.max(0, (-x2 * 0.5 - y2 * 0.6 + z1 * 0.6));
      let a = (0.2 + 0.8 * prof) * (0.75 + 0.25 * Math.sin(p.fase + now * 0.003)) * (0.8 + luz * 0.5);
      if (p.viento) a *= 1.3;
      if (local < 0 && !this.reduce) continue;
      if (prof < 0.38) {
        const s2 = (2.5 + (0.38 - prof) * 14) * (p.r + 0.6);
        ctx.globalAlpha = Math.min(1, a * 0.28);
        ctx.drawImage(this.sprite, p.x - s2 / 2, p.y - s2 / 2, s2, s2);
        ctx.globalAlpha = 1;
      } else {
        this.pintar(ctx, p, a, 0.7 + prof * 0.7, now);
      }
    }
    if (this.pares && t > 12 && !this.reduce) {
      const ap = Math.min(1, (t - 12) / 2);
      ctx.lineWidth = 0.5;
      for (let i = 0; i < this.pares.length; i++) {
        const [pa, pb, fase] = this.pares[i];
        const pr = Math.min(pa.prof || 0, pb.prof || 0);
        if (pr < 0.45) continue;
        const v = Math.max(0, Math.sin(fase + t * 0.35));
        const al = ap * v * v * (pr - 0.45) * 0.9;
        if (al < 0.01) continue;
        ctx.strokeStyle = 'rgba(255,120,80,' + al.toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
      }
    }
    for (let i = this.texto.length - 1; i >= 0; i--) {
      const p = this.texto[i];
      const local = t - p.retraso;
      if (local < 0) { this.ascenso(p, t, now); continue; }
      this.atraer(p, p.tx, p.ty, local);
      let a = 0.65 + 0.35 * Math.sin(p.fase + now * 0.005);
      if (t > 4.3) {
        const f = Math.max(0, 1 - (t - 4.3) / 1.4);
        if (f <= 0) { this.texto.splice(i, 1); continue; }
        a *= 0.2 + 0.8 * f;
      }
      this.pintar(ctx, p, a, 1, now);
    }
  }
}

export function initHero() {
  const seccion = document.getElementById('inicio');
  if (!seccion) return null;
  return new Hero(seccion);
}
