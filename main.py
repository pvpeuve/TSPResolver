from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

from pydantic import BaseModel
from typing import List

from geocodificador import Geocodificador
from optimizador import Optimizador
geo = Geocodificador()

app = FastAPI(title="TPS Resolver")
templates = Jinja2Templates(directory="frontend/src")
app.mount("/static", StaticFiles(directory="frontend/dist"), name="static")
app.mount("/src", StaticFiles(directory="frontend/src"), name="src")

class DireccionesInput(BaseModel):
    direcciones: List[str]

class RutaOutput(BaseModel):
    orden_optimo: List[str]
    tiempos_optimos: List[float]
    coordenadas: List[str]
    ruta_indices: List[int]

@app.get("/")
async def home(request: Request):
    """ Renderiza la página principal. """
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/encontrar_mejor_ruta", response_model=RutaOutput)
def encontrar_mejor_ruta(data: DireccionesInput):
    """ Encuentra la ruta óptima entre las direcciones proporcionadas. """
    coordenadas = geo.buscar_coordenadas(data.direcciones)
    if not coordenadas:
        return {
            "orden_optimo": ["Error geocodificando direcciones"],
            "tiempos_optimos": [],
            "coordenadas": [],
            "ruta_indices": []
        }

    matriz_tiempos = geo.obtener_matriz_tiempos(coordenadas)
    if not matriz_tiempos:
        return {
            "orden_optimo": ["Error obteniendo tiempos de ruta"],
            "tiempos_optimos": [],
            "coordenadas": coordenadas,
            "ruta_indices": []
        }

    optimizador = Optimizador(data.direcciones, matriz_tiempos)
    ruta_indices = optimizador.resolver_ruta_optima()

    orden_direcciones = [data.direcciones[i] for i in ruta_indices]
    tiempos_optimos = optimizador.obtener_tiempos_optimos()

    return {
        "orden_optimo": orden_direcciones,
        "tiempos_optimos": tiempos_optimos,
        "coordenadas": coordenadas,
        "ruta_indices": ruta_indices
    }