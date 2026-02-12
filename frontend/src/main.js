const boton = document.getElementById("calcularRuta");
const textarea = document.getElementById("direcciones");
const resultadoDiv = document.getElementById("resultado");


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
    resultadoDiv.innerHTML = "Calculando ruta óptima... ⏳";
    try {
        const response = await fetch("http://127.0.0.1:8000/encontrar_mejor_ruta", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ direcciones: lineas })
        });
        const data = await response.json();
        if (data.orden_optimo[0].startsWith("Error")) {
            resultadoDiv.innerHTML = `<span class="text-red-600">${data.orden_optimo[0]}</span>`;
            return;
        }
        resultadoDiv.innerHTML = `
            <ul class="list-none list-inside">
                ${data.orden_optimo.map((d, i) => 
                    `
                    <li class="font-bold text-white bg-blue-800 rounded-2xl py-1 mx-4 my-2 lg:mx-8">${i + 1} - ${d}</li>
                    ${i < data.tiempos_optimos.length ? 
                    `<div class="my-4">
                        <span class="font-bold text-white bg-blue-600 px-2 py-1 rounded-md inline-block">
                            ${
                                Math.floor(data.tiempos_optimos[i] / 3600) > 0 ? 
                                    `${Math.floor(data.tiempos_optimos[i] / 3600)} h ${Math.floor((data.tiempos_optimos[i] % 3600) / 60)} min` : 
                                    `${Math.floor(data.tiempos_optimos[i] / 60)} min`
                            }
                        </span>
                    </div>` : ""}
                `
                ).join("")}
            </ul>
        `;
        if (!data.orden_optimo[0].startsWith("Error")) {
            const rutaIndices = data.ruta_indices;
            await dibujarEnMapa(lineas, data.coordenadas, rutaIndices);
        }
    } catch (error) {
        resultadoDiv.innerHTML = `<span class="text-red-600">Error al conectar con el servidor</span>`;
        console.error(error);
    }
});
