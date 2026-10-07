// ===== REFERENCIAS A LOS ELEMENTOS DEL HTML =====
const tarjetas = document.querySelectorAll('.tarjeta');   // las tres obras
const resumen = document.getElementById('resumen');       // promedio de valoraciones
const visor = document.getElementById('visor');           // ventana emergente
const visorTitulo = document.getElementById('visorTitulo');
const visorObra = document.getElementById('visorObra');
const btnCerrar = document.getElementById('btnCerrar');
// ===== CLAVE DE LOCALSTORAGE =====
const CLAVE = 'artes_estado';
// ===== ESTADO POR DEFECTO =====
// valoraciones: estrellas por obra (0 a 5) | comentarios: texto por obra
const estadoInicial = { valoraciones: {}, comentarios: {} };
// ===== LEER EL ESTADO GUARDADO =====
function leerEstado() {
    try {
        const guardado = localStorage.getItem(CLAVE);
        // Si hay datos guardados los usamos; si no, partimos del estado inicial
        return guardado ? { ...estadoInicial, ...JSON.parse(guardado) } : { ...estadoInicial };
    } catch (error) {
      return { ...estadoInicial }; // si algo falla, empezamos desde cero
    }
}
// Al cargar la página recuperamos las valoraciones y comentarios guardados
let estado = leerEstado();
// ===== GUARDAR EL ESTADO =====
function guardarEstado() {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
}
// ===== CREAR LOS 5 BOTONES DE ESTRELLAS DE CADA OBRA =====
function crearEstrellas() {
    tarjetas.forEach(tarjeta => {
        const contenedor = tarjeta.querySelector('.estrellas');
        for (let i = 1; i <= 5; i++) {
            const boton = document.createElement('button');
            boton.type = 'button';
            boton.className = 'estrella';
            boton.textContent = '★';
            boton.dataset.estrella = i;                    // número de la estrella (1 a 5)
            boton.setAttribute('aria-label', `${i} de 5 estrellas`);
            contenedor.appendChild(boton);
        }
        // Texto que muestra la valoración actual (por ejemplo "4 de 5")
        const puntaje = document.createElement('span');
        puntaje.className = 'puntaje';
        contenedor.appendChild(puntaje);
    });
}
// ===== VALORAR UNA OBRA =====
function valorar(id, cantidad) {
    // Si pulsas la misma estrella otra vez, la valoración se quita (vuelve a 0)
    estado.valoraciones[id] = estado.valoraciones[id] === cantidad ? 0 : cantidad;
    guardarEstado();
    dibujarPantalla();
}
// ===== ABRIR LA OBRA EN GRANDE =====
function ampliar(tarjeta) {
    visorTitulo.textContent = tarjeta.querySelector('h2').textContent;
    visorObra.innerHTML = '';                                      // limpia la obra anterior
    visorObra.appendChild(tarjeta.querySelector('svg').cloneNode(true));  // copia el dibujo
    visor.showModal();                                             // abre la ventana
}
// ===== ACTUALIZAR LO QUE SE VE EN PANTALLA =====
function dibujarPantalla() {
    let suma = 0;       // suma de las valoraciones
    let valoradas = 0;  // cuántas obras tienen valoración
    tarjetas.forEach(tarjeta => {
        const nota = estado.valoraciones[tarjeta.dataset.id] || 0;
        // Marca las estrellas hasta la nota elegida
        tarjeta.querySelectorAll('.estrella').forEach(estrella => {
            estrella.classList.toggle('activa', Number(estrella.dataset.estrella) <= nota);
        });
        tarjeta.querySelector('.puntaje').textContent = nota ? `${nota} de 5` : 'Sin valorar';
        if (nota > 0) { suma += nota; valoradas++; }
    });
    // Promedio general de la galería
    resumen.textContent = valoradas
        ? `Valoración promedio: ${(suma / valoradas).toFixed(1)} de 5 (${valoradas} de ${tarjetas.length} obras)`
        : 'Aún no has valorado ninguna obra.';
}
// ===== RESTAURAR LOS COMENTARIOS EN LOS CAMPOS DE TEXTO =====
function cargarComentarios() {
    tarjetas.forEach(tarjeta => {
        tarjeta.querySelector('textarea').value = estado.comentarios[tarjeta.dataset.id] || '';
    });
}
// ===== EVENTOS =====
// Un solo "click" en el documento detecta estrellas y botones de ampliar
document.addEventListener('click', evento => {
    const estrella = evento.target.closest('[data-estrella]');
    const ampliarBtn = evento.target.closest('[data-ampliar]');
    if (estrella) valorar(estrella.closest('.tarjeta').dataset.id, Number(estrella.dataset.estrella));
    if (ampliarBtn) ampliar(ampliarBtn.closest('.tarjeta'));
});
// Cada vez que se escribe un comentario, se guarda al instante
document.addEventListener('input', evento => {
    if (!evento.target.matches('textarea')) return;
    estado.comentarios[evento.target.closest('.tarjeta').dataset.id] = evento.target.value;
    guardarEstado();
});
// Cerrar el visor con el botón o haciendo clic fuera de la imagen
btnCerrar.addEventListener('click', () => visor.close());
visor.addEventListener('click', evento => { if (evento.target === visor) visor.close(); });
// ===== INICIO: se ejecuta al cargar o refrescar la página =====
crearEstrellas();     // crea las estrellas de cada obra
cargarComentarios();  // recupera los comentarios escritos
dibujarPantalla();    // recupera las valoraciones y el promedio