from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

class Optimizador:
    """
    Clase que optimiza la ruta entre las direcciones proporcionadas.

    Methods:
        resolver_ruta_optima (list[str], list[list[float]] -> list[int] | None): Resuelve la ruta óptima entre las direcciones.
        obtener_tiempos_optimos (list[int] -> list[float]): Obtiene los tiempos óptimos de la ruta.
        mostrar_orden_optimo (list[int] -> list[str]): Muestra el orden óptimo de las direcciones.
    """
    def __init__(self, direcciones, matriz_tiempos):
        self.direcciones = direcciones
        self.matriz_tiempos = matriz_tiempos
        self.cantidad_vehiculos = 1
        self.nodo_inicial = 0

    def resolver_ruta_optima(self) -> list[int] | None:
        n = len(self.matriz_tiempos)
        manager = pywrapcp.RoutingIndexManager(n, self.cantidad_vehiculos, self.nodo_inicial)
        routing = pywrapcp.RoutingModel(manager)
        
        def tiempo_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return int(self.matriz_tiempos[from_node][to_node])
        transit_callback_index = routing.RegisterTransitCallback(tiempo_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        solution = routing.SolveWithParameters(search_parameters)
        if solution:
            index = routing.Start(0)
            ruta = []
            while not routing.IsEnd(index):
                ruta.append(manager.IndexToNode(index))
                index = solution.Value(routing.NextVar(index))
            self.orden_optimo = ruta
            return self.orden_optimo
        else:
            return None

    def obtener_tiempos_optimos(self) -> list[float]:
        tiempos = []
        for i in range(len(self.orden_optimo) - 1):
            nodo_anterior = self.orden_optimo[i]
            nodo_siguiente = self.orden_optimo[i+1]
            tiempos.append(self.matriz_tiempos[nodo_anterior][nodo_siguiente])
        return tiempos

    def mostrar_orden_optimo(self) -> list[str]:
        self.orden_direcciones = [self.direcciones[i] for i in self.orden_optimo]
        for i, d in enumerate(self.orden_direcciones, 1):
            print(f"{i}. {d}")
        return self.orden_direcciones

if __name__ == "__main__":
    # Ejemplo de uso
    direcciones = ["Calle 1", "Calle 2", "Calle 3"]
    matriz_tiempos = [[0, 10, 15], [10, 0, 20], [15, 20, 0]]
    optimizador = Optimizador(direcciones, matriz_tiempos)
    optimizador.resolver_ruta_optima()
    print("Orden óptimo:", optimizador.orden_optimo)
    optimizador.mostrar_orden_optimo()
    print("Tiempos óptimos:", optimizador.obtener_tiempos_optimos())