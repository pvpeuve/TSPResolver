const boton = document.getElementById("calcularRuta");
const textarea = document.getElementById("direcciones");
const resultadoDiv = document.getElementById("resultado");
const btnSimple = document.getElementById("btn-simple");
const btnReal = document.getElementById("btn-real");

let modoVista = "simple";
let datosActuales = null;

let mapa;
let marcadores = [];
let lineaRutaSimple;
let lineaRutaReal;

function actualizarBotones() {
    if (modoVista === "simple") {
        btnSimple.classList.add("bg-blue-600", "text-white", "border-white");
        btnSimple.classList.remove("bg-gray-200");

        btnReal.classList.remove("bg-blue-600", "text-white", "border-white");
        btnReal.classList.add("bg-gray-200");
    } else {
        btnReal.classList.add("bg-blue-600", "text-white", "border-white");
        btnReal.classList.remove("bg-gray-200");

        btnSimple.classList.remove("bg-blue-600", "text-white", "border-white");
        btnSimple.classList.add("bg-gray-200");
    }
}

function animarCarga() {
    resultadoDiv.innerHTML = `
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
        <span>
            <span style="
                display: inline-block; 
                width: 20px; 
                height: 20px; 
                border: 3px solid #1D69D0;
                border-top: 3px solid transparent; 
                border-radius: 50%; 
                animation: spin 0.5s linear infinite;
                margin-right: 8px;
                vertical-align: middle;
            "></span> 
            Calculando ruta óptima...
        </span>
    `;
}

function formatearTiempo(segundos) {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    return horas > 0 ? `${horas} h ${minutos} min` : `${minutos} min`;
}

function crearElementoRuta(direccion, index, tiempo) {
    const li = document.createElement('li');
    li.className = 'font-bold text-white bg-blue-800 rounded-2xl py-1 mx-4 my-2 lg:mx-8';
    li.textContent = `${index + 1} - ${direccion}`;
    
    const contenedor = document.createElement('div');
    contenedor.className = 'my-4';
    
    if (tiempo !== undefined) {
        const span = document.createElement('span');
        span.className = 'font-bold text-white bg-blue-600 px-2 py-1 rounded-md inline-block';
        span.textContent = formatearTiempo(tiempo);
        contenedor.appendChild(span);
    }
    
    return [li, contenedor];
}

function inicializarMapa() {
    mapa = L.map('mapa').setView([42.0, -8.0], 7);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(mapa);
}

function limpiarMapa(limpiarMarcadores=true, limpiarLinea=true) {
    if (limpiarMarcadores) {
        marcadores.forEach(marker => mapa.removeLayer(marker));
        marcadores = [];
    }
    if (limpiarLinea) {
        if (lineaRutaSimple) {
            mapa.removeLayer(lineaRutaSimple);
            lineaRutaSimple = null;
        }
        if (lineaRutaReal) {
            mapa.removeLayer(lineaRutaReal);
            lineaRutaReal = null;
        }
    }
}

function obtenerMarcadores(direcciones, coordenadas, rutaIndices) {
    const coordsOrdenadas = rutaIndices.map(i => {
        const [lon, lat] = coordenadas[i].split(',');
        return [parseFloat(lat), parseFloat(lon)];
    });
    coordsOrdenadas.forEach((coord, index) => {
        const marker = L.marker(coord)
            .addTo(mapa)
            .bindPopup(`<b>${index + 1}.</b> ${direcciones[rutaIndices[index]]}`);
        marcadores.push(marker);
    });
    return coordsOrdenadas;
}

function ajustarZoom() {
    if (marcadores.length > 0) {
        const group = new L.featureGroup(marcadores);
        mapa.fitBounds(group.getBounds().pad(0.1));
    }
}

async function dibujarRutaIndices(direcciones, coordenadas, rutaIndices) {
    const coordsOrdenadas = obtenerMarcadores(direcciones, coordenadas, rutaIndices);
    
    if (coordsOrdenadas.length > 1) {
        lineaRutaSimple = L.polyline(coordsOrdenadas, {
            color: 'red',
            weight: 4,
            opacity: 0.8
        }).addTo(mapa);
    }
    ajustarZoom();
}

async function dibujarRutaGeoJson(coordenadas, rutaIndices, rutaGeoJson) {
    const coordsOrdenadas = rutaIndices.map(i => {
        const [lon, lat] = coordenadas[i].split(',');
        return [parseFloat(lat), parseFloat(lon)];
    });

    if (coordsOrdenadas.length > 1) {
        lineaRutaReal = L.geoJSON(rutaGeoJson, {
            color: 'red',
            weight: 4,
            opacity: 0.8
        }).addTo(mapa);
    }
    ajustarZoom();
}

function redibujarRuta() {
    if (!datosActuales) return;

    limpiarMapa(false, true);

    const { direcciones, coordenadas, ruta_indices, ruta_geojson } = datosActuales;

    if (modoVista === "simple") {
        dibujarRutaIndices(direcciones, coordenadas, ruta_indices);
    } else if (modoVista === "real" && ruta_geojson) {
        dibujarRutaGeoJson(coordenadas, ruta_indices, ruta_geojson);
    }
}

function cambiarVista(modo) {
    modoVista = modo;
    actualizarBotones();
    redibujarRuta();
}

document.addEventListener("DOMContentLoaded", () => {
    inicializarMapa();
});


boton.addEventListener("click", async () => {
    const lineas = textarea.value.split("\n")
        .map(d => d.trim())
        .filter(d => d.length > 0);
    if (lineas.length < 2) {
        resultadoDiv.innerHTML = "Introduce al menos 2 direcciones.";
        return;
    }
    limpiarMapa(true, true);
    animarCarga();
    try {
        const response = await fetch("http://127.0.0.1:8000/encontrar_mejor_ruta", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ direcciones: lineas })
        });
        const data = await response.json();
        // Verificar si hay error en la respuesta
        if (data.orden_optimo && data.orden_optimo[0] && data.orden_optimo[0].startsWith("Error")) {
            resultadoDiv.innerHTML = `<span class="text-red-600">${data.orden_optimo[0]}</span>`;
            return;
        }
        // Verificar estructura completa de datos
        if (!data.orden_optimo || !data.tiempos_optimos || !data.coordenadas || !data.ruta_indices) {
            resultadoDiv.innerHTML = `<span class="text-red-600">Error: Respuesta incompleta del servidor</span>`;
            return;
        }
        const fragment = document.createDocumentFragment();
        const ul = document.createElement('ul');
        ul.className = 'list-none list-inside';
        data.orden_optimo.forEach((direccion, i) => {
            const [li, contenedor] = crearElementoRuta(direccion, i, data.tiempos_optimos[i]);
            ul.appendChild(li);
            if (contenedor.firstChild) {
                ul.appendChild(contenedor);
            }
        });
        fragment.appendChild(ul);
        resultadoDiv.innerHTML = '';
        resultadoDiv.appendChild(fragment);
        datosActuales = {
            direcciones: lineas,
            coordenadas: data.coordenadas,
            ruta_indices: data.ruta_indices,
            ruta_geojson: data.ruta_geojson
        };
        redibujarRuta()
    } catch (error) {
        resultadoDiv.innerHTML = `<span class="text-red-600">Error al conectar con el servidor</span>`;
        console.error(error);
    }
});

btnSimple.addEventListener("click", () => cambiarVista("simple"));
btnReal.addEventListener("click", () => cambiarVista("real"));