const boton = document.getElementById("calcularRuta");
const textarea = document.getElementById("direcciones");
const resultadoDiv = document.getElementById("resultado");

function animarCarga() {
    resultadoDiv.innerHTML = `
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
        <span class="text-blue-600 font-bold">
            <span style="
                display: inline-block; 
                width: 20px; 
                height: 20px; 
                border: 3px solid #3B82F6; 
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

let mapa;
let marcadores = [];
let lineaRuta;

function inicializarMapa() {
    mapa = L.map('mapa').setView([42.0, -8.0], 7);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(mapa);
}

function limpiarMapa() {
    marcadores.forEach(marker => mapa.removeLayer(marker));
    marcadores = [];
    if (lineaRuta) {
        mapa.removeLayer(lineaRuta);
        lineaRuta = null;
    }
}

async function dibujarEnMapa(direcciones, coordenadas, rutaIndices) {
    limpiarMapa();
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
    if (coordsOrdenadas.length > 1) {
        lineaRuta = L.polyline(coordsOrdenadas, {
            color: 'blue',
            weight: 4,
            opacity: 0.8
        }).addTo(mapa);
    }
    if (marcadores.length > 0) {
        const group = new L.featureGroup(marcadores);
        mapa.fitBounds(group.getBounds().pad(0.1));
    }
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
        
        const rutaIndices = data.ruta_indices;
        await dibujarEnMapa(lineas, data.coordenadas, rutaIndices);
    } catch (error) {
        resultadoDiv.innerHTML = `<span class="text-red-600">Error al conectar con el servidor</span>`;
        console.error(error);
    }
});
