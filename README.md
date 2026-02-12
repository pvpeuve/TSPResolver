# TSP Resolver 🚗

Optimizador de rutas utilizando el algoritmo **Traveling Salesman Problem (TSP)** con interfaz web interactiva y mapas en tiempo real.

## 🚀 Características

- 🗺️ **Mapa interactivo** con Leaflet.js
- 📍 **Geocodificación** de direcciones a coordenadas
- 🚀 **Optimización de rutas** con OR-Tools
- ⏱️ **Cálculo de tiempos** de viaje entre puntos
- 📱 **Diseño responsive** con Tailwind CSS
- 🔄 **Visualización en tiempo real** de la ruta óptima

## 🔧 Tecnologías

### Backend
- **FastAPI** - Framework web moderno para Python
- **OR-Tools** - Biblioteca de optimización de Google
- **Nominatim API** - Geocodificación de direcciones
- **OSRM API** - Cálculo de matrices de tiempos

### Frontend
- **Leaflet.js** - Mapas interactivos
- **Tailwind CSS** - Framework de CSS utilitario
- **JavaScript ES6+** - Lógica del cliente

## 📋 Requisitos

- Python 3.8+
- Node.js 16+
- npm o yarn

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/TSPResolver.git
cd TSPResolver
```

### 2. Configurar entorno Python
```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

### 3. Configurar frontend
```bash
cd frontend

# Instalar dependencias npm
npm install

# Compilar CSS de Tailwind
npm run build-css

# Volver al directorio principal
cd ..
```

## ▶️ Ejecución

### 1. Iniciar el servidor backend
```bash
python main.py
```

### 2. Acceder a la aplicación
Abre tu navegador en: **http://localhost:8000**

## 🎯 Uso

1. **Introduce las direcciones** en el área de texto (una por línea)
2. **Haz clic en "Calcular mejor ruta"**
3. **Visualiza los resultados:**
   - Lista ordenada de direcciones con tiempos
   - Mapa interactivo con marcadores y ruta
4. **Explora el mapa** haciendo clic en los marcadores

## 📁 Estructura del Proyecto

```
TSPResolver/
├── main.py              # Servidor FastAPI principal
├── geocodificador.py    # Lógica de geocodificación
├── optimizador.py       # Algoritmo TSP con OR-Tools
├── requirements.txt     # Dependencias Python
├── README.md           # Documentación
├── .gitignore          # Archivos ignorados por Git
└── frontend/           # Aplicación web
    ├── src/
    │   ├── index.html  # Página principal
    │   ├── input.css   # CSS fuente de Tailwind
    │   ├── main.js     # Lógica JavaScript
    │   └── favicon.ico # Icono de la aplicación
    ├── dist/
    │   └── output.css  # CSS compilado
    ├── package.json    # Dependencias npm
    └── tailwind.config.js # Configuración de Tailwind
```

## 🔧 Configuración

### Variables de Entorno
No se requieren variables de entorno para el funcionamiento básico.

### Personalización
- **Mapa inicial:** Modifica las coordenadas en `main.js` (línea 11)
- **Estilos:** Edita `tailwind.config.js` para personalizar Tailwind
- **APIs:** Las APIs de Nominatim y OSRM son gratuitas y no requieren API key

## 🐛 Problemas Comunes

### **Error: "Error geocodificando direcciones"**
- Verifica tu conexión a internet
- Asegúrate que las direcciones son válidas
- Las APIs pueden tener límites de uso

### **Error: "Error obteniendo tiempos de ruta"**
- Revisa que las coordenadas sean válidas
- La API de OSRM puede estar temporalmente no disponible

### **El mapa no se carga**
- Verifica la consola del navegador (F12)
- Asegúrate que Leaflet.js se esté cargando correctamente

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la **MIT License** - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- **Google OR-Tools** - Biblioteca de optimización
- **Leaflet.js** - Biblioteca de mapas
- **OpenStreetMap** - Datos de mapas
- **Nominatim** - Servicio de geocodificación
- **OSRM** - Servicio de rutas