import { initHero } from './hero.js';
import { initServicios } from './servicios.js';
import { initPortafolio } from './portafolio.js';
import { initProceso } from './proceso.js';
import { initContacto } from './contacto.js';
import { initMenu, initColorBarra } from './menu.js';
import { initDespedida } from './despedida.js';

initHero();
initServicios();
initPortafolio();
initProceso();
initContacto();
initMenu();
initColorBarra();
initDespedida();

// Enlace pendiente: el Libro de Reclamaciones aún no tiene destino.
const libro = document.getElementById('libro-reclamaciones');
if (libro) libro.addEventListener('click', (e) => e.preventDefault());
