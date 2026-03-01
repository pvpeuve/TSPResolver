import requests

class Geocodificador:
    """
    Clase que geocodifica direcciones y obtiene la matriz de tiempos.

    Methods:
        buscar_coordenadas (list[str] -> list[str] | None): Busca las coordenadas de las direcciones.
        obtener_matriz_tiempos (list[str] -> list[list[float]] | None): Obtiene la matriz de tiempos.
    """
    def __init__(self):
        self.url_address = "https://nominatim.openstreetmap.org/search"
        self.url_coords = "http://router.project-osrm.org/table/v1/driving/"
        self.url_route = "http://router.project-osrm.org/route/v1/driving/"

    def buscar_coordenadas(self, direcciones: list[str]) -> list[str] | None:
        coordenadas = []

        for d in direcciones:
            headers = {
                "User-Agent": "MVP-EnfermeraApp/1.0 (contacto: tuemail@ejemplo.com)"
            }
            params = {
                "q": d,
                "format": "json",
                "limit": 1,
                "countrycodes": "es"
            }
            try:
                response = requests.get(self.url_address, params=params, headers=headers, timeout=5)
                response.raise_for_status()
                data = response.json()
                if not data:
                    return None
                lugar = data[0]
                # tipo = lugar.get("type", "")
                # clase = lugar.get("class", "")
                # es_carretera = "road" in tipo
                # es_lugar_valido = clase in ["building", "place", "highway"]
                # print("DEBUG NOMINATIM →", d, "class:", clase, "type:", tipo)
                # if not (es_carretera or es_lugar_valido):
                #     return None
            except requests.RequestException:
                return None
            lon = data[0]["lon"]
            lat = data[0]["lat"]
            coordenadas.append(f"{lon},{lat}")  # string para OSRM
        return coordenadas

    def obtener_matriz_tiempos(self, coordenadas: list[str]) -> list[list[float]] | None:
        coords_osrm = ";".join(coordenadas)
        url = f"{self.url_coords}{coords_osrm}"
        params = {"annotations": "duration"}
        try:
            response = requests.get(url, params=params, timeout=5)
            response.raise_for_status()
            data = response.json()
        except requests.RequestException:
            return None
        return data["durations"]

    def obtener_ruta(self, coordenadas: list[str]) -> dict | None:
        coords_osrm = ";".join(coordenadas)
        url = f"{self.url_route}{coords_osrm}"
        params = {"overview": "full", "geometries": "geojson"}
        try:
            response = requests.get(url, params=params, timeout=5)
            response.raise_for_status()
            data = response.json()
        except requests.RequestException:
            return None
        return data

if __name__ == "__main__":
    geocodificador = Geocodificador()
    direcciones = ["Madrid", "Barcelona", "Valencia"]
    coordenadas = geocodificador.buscar_coordenadas(direcciones)
    print("Coordenadas:", coordenadas)
    matriz_tiempos = geocodificador.obtener_matriz_tiempos(coordenadas)
    print("Matriz de tiempos:", matriz_tiempos)
    ruta = geocodificador.obtener_ruta(coordenadas)
    print("Ruta:", ruta)