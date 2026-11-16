const WA = 'https://wa.me/51994192136?text=';

export function initContacto() {
  const form = document.getElementById('ct-form');
  if (!form) return;
  const $ = (id) => document.getElementById(id);
  const campos = {
    nombre: $('ct-nombre'), negocio: $('ct-negocio'), rubro: $('ct-rubro'), dolor: $('ct-dolor')
  };
  const chipWeb = $('ct-web'), chipIA = $('ct-ia'), acepta = $('ct-acepta');
  const enviar = $('ct-enviar'), intentar = $('ct-intentar');
  const errs = {
    nombre: $('err-nombre'), negocio: $('err-negocio'), rubro: $('err-rubro'),
    dolor: $('err-dolor'), interes: $('err-interes'), acepta: $('err-acepta')
  };
  const s = { web: false, ia: false, intento: false };

  form.addEventListener('submit', (e) => e.preventDefault());

  function estilo(chip, on) {
    chip.setAttribute('aria-pressed', on ? 'true' : 'false');
    chip.style.boxShadow = 'inset 0 0 0 1px ' + (on ? '#BF0603' : 'rgba(0,0,0,0.3)');
    chip.style.backgroundColor = on ? '#BF0603' : 'transparent';
    chip.style.color = on ? '#FFFFFF' : '#111111';
  }

  function datos() {
    const v = (k) => campos[k].value.trim();
    const intereses = [s.web ? 'Ecosistema web' : '', s.ia ? 'Posicionamiento en IA' : ''].filter(Boolean);
    return { nombre: v('nombre'), negocio: v('negocio'), rubro: v('rubro'), dolor: v('dolor'), intereses, acepta: acepta.checked };
  }

  function actualizar() {
    const d = datos();
    const faltas = {
      nombre: !d.nombre, negocio: !d.negocio, rubro: !d.rubro, dolor: !d.dolor,
      interes: !d.intereses.length, acepta: !d.acepta
    };
    const listo = !Object.values(faltas).some(Boolean);
    Object.keys(errs).forEach((k) => {
      const mostrar = s.intento && faltas[k];
      errs[k].hidden = !mostrar;
      const input = campos[k] || (k === 'acepta' ? acepta : null);
      if (input) input.setAttribute('aria-invalid', mostrar ? 'true' : 'false');
    });
    estilo(chipWeb, s.web);
    estilo(chipIA, s.ia);
    const msg = 'Hola, Elion Blanc. Quiero pedir mi diagnóstico gratis.\n\n'
      + 'Nombre: ' + d.nombre + '\n'
      + 'Negocio: ' + d.negocio + '\n'
      + 'Rubro: ' + d.rubro + '\n'
      + 'Me interesa: ' + d.intereses.join(' y ') + '\n'
      + 'Quiero mejorar: ' + d.dolor + '\n\n'
      + 'Acepto la Política de privacidad.';
    enviar.href = WA + encodeURIComponent(msg);
    enviar.hidden = !listo;
    intentar.hidden = listo;
    return faltas;
  }

  Object.values(campos).forEach((el) => el.addEventListener('input', actualizar));
  acepta.addEventListener('change', actualizar);
  chipWeb.addEventListener('click', () => { s.web = !s.web; actualizar(); });
  chipIA.addEventListener('click', () => { s.ia = !s.ia; actualizar(); });
  intentar.addEventListener('click', () => {
    s.intento = true;
    const faltas = actualizar();
    // Lleva el foco al primer dato faltante.
    const orden = ['nombre', 'negocio', 'rubro', 'interes', 'dolor', 'acepta'];
    const primero = orden.find((k) => faltas[k]);
    const destino = primero === 'interes' ? chipWeb : primero === 'acepta' ? acepta : campos[primero];
    if (destino) destino.focus();
  });

  actualizar();
}
