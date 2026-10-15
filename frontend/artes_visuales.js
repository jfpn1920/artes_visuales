//----------------------------------//
//--|funcionalidad_artes_visuales|--//      
//----------------------------------//
const tarjetas = document.querySelectorAll(".tarjeta");
const resumen = document.querySelector("#resumen");
const visor = document.querySelector("#visor");
const visorTitulo = document.querySelector("#visorTitulo");
const visorObra = document.querySelector("#visorObra");
const btnCerrar = document.querySelector("#btnCerrar");
const CLAVE = "artes_estado";
const estadoInicial = {
    valoraciones: {},
    comentarios: {}
};
let estado = {
    valoraciones: {},
    comentarios: {}
};
//--------------------------//
//--|leer_datos_guardados|--//
//--------------------------//
function leerEstado() {
    try {
        const datosGuardados = localStorage.getItem(CLAVE);
        if (datosGuardados) {
            const datos = JSON.parse(datosGuardados);
            estado = {
                valoraciones: datos.valoraciones || {},
                comentarios: datos.comentarios || {}
            };
        } else {
            estado = {
                valoraciones: {},
                comentarios: {}
            };
        }
    } catch (error) {
        estado = {
            valoraciones: {},
            comentarios: {}
        };
    }
}
//--------------------------------//
//--|guardar_datos_del_proyecto|--//
//--------------------------------//
function guardarEstado() {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
}
//-----------------------------------//
//--|crear_estrellas_de_valoracion|--//
//-----------------------------------//
function crearEstrellas() {
    tarjetas.forEach(function(tarjeta) {
        const contenedor = tarjeta.querySelector(".estrellas");
        const id = tarjeta.dataset.id;
        contenedor.innerHTML = "";
        for (let i = 1; i <= 5; i++) {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.classList.add("estrella");
            boton.dataset.id = id;
            boton.dataset.valor = i;
            boton.textContent = "★";
            boton.setAttribute("aria-label", "Valorar con " + i + " estrellas");
            contenedor.appendChild(boton);
        }
        const valoracion = document.createElement("span");
        valoracion.classList.add("valoracion");
        contenedor.appendChild(valoracion);
    });
}
//--------------------------//
//--|registrar_valoracion|--//
//--------------------------//
function valorar(id, cantidad) {
    if (estado.valoraciones[id] === cantidad) {
        delete estado.valoraciones[id];
    } else {
        estado.valoraciones[id] = cantidad;
    }
    guardarEstado();
    dibujarPantalla();
}
//-------------------------------//
//--|ampliar_obra_seleccionada|--//
//-------------------------------//
function ampliar(tarjeta) {
    const titulo = tarjeta.querySelector("h2");
    const obra = tarjeta.querySelector("svg");
    visorTitulo.textContent = titulo.textContent;
    visorObra.innerHTML = "";
    visorObra.appendChild(obra.cloneNode(true));
    visor.showModal();
}
//-------------------------------------//
//--|actualizar_estrellas_y_promedio|--//
//-------------------------------------//
function dibujarPantalla() {
    let suma = 0;
    let cantidad = 0;
    tarjetas.forEach(function(tarjeta) {
        const id = tarjeta.dataset.id;
        const puntuacion = estado.valoraciones[id] || 0;
        const estrellas = tarjeta.querySelectorAll(".estrella");
        const textoValoracion = tarjeta.querySelector(".valoracion");
        estrellas.forEach(function(estrella) {
            const valor = Number(estrella.dataset.valor);
            const activa = valor <= puntuacion;
            estrella.classList.toggle("activa", activa);
            estrella.setAttribute("aria-pressed", String(puntuacion === valor));
        });
        if (puntuacion > 0) {
            textoValoracion.textContent = puntuacion + "/5";
            suma += puntuacion;
            cantidad++;
        } else {
            textoValoracion.textContent = "Sin valorar";
        }
    });
    if (cantidad > 0) {
        const promedio = (suma / cantidad).toFixed(1);
        resumen.textContent = "Promedio de valoraciones: " + promedio + "/5";
    } else {
        resumen.textContent = "Todavía no hay valoraciones.";
    }
}
//----------------------------------//
//--|cargar_comentarios_guardados|--//
//----------------------------------//
function cargarComentarios() {
    tarjetas.forEach(function(tarjeta) {
        const id = tarjeta.dataset.id;
        const campoComentario = tarjeta.querySelector("textarea");
        campoComentario.value = estado.comentarios[id] || "";
    });
}
//----------------------------------//
//--|detectar_clics_en_la_galeria|--//
//----------------------------------//
document.addEventListener("click", function(evento) {
    const botonEstrella = evento.target.closest(".estrella");
    const botonAmpliar = evento.target.closest("[data-ampliar]");
    if (botonEstrella) {
        valorar(
            botonEstrella.dataset.id,
            Number(botonEstrella.dataset.valor)
        );
    }
    if (botonAmpliar) {
        const tarjeta = botonAmpliar.closest(".tarjeta");
        ampliar(tarjeta);
    }
});
//-------------------------------------//
//--|guardar_comentarios_al_escribir|--//
//-------------------------------------//
document.addEventListener("input", function(evento) {
    if (evento.target.matches(".tarjeta textarea")) {
        const tarjeta = evento.target.closest(".tarjeta");
        const id = tarjeta.dataset.id;
        estado.comentarios[id] = evento.target.value;
        guardarEstado();
    }
});
//---------------------------//
//--|cerrar_visor_de_obras|--//
//---------------------------//
btnCerrar.addEventListener("click", function() {
    visor.close();
});
visor.addEventListener("click", function(evento) {
    if (evento.target === visor) {
        visor.close();
    }
});
//----------------------//
//--|iniciar_proyecto|--//
//----------------------//
leerEstado();
crearEstrellas();
cargarComentarios();
dibujarPantalla();