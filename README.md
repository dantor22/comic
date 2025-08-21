# Comic Reader - Lector de Historietas PDF

Aplicación web moderna y minimalista para leer historietas en formato PDF.

## Características

- 📖 Visualización de PDFs con controles intuitivos
- 🎨 Interfaz oscura moderna y sobria
- 📱 Diseño responsive para móvil y escritorio
- ⌨️ Atajos de teclado para navegación rápida
- 🔍 Búsqueda de historietas en la biblioteca
- 📤 Carga de PDFs desde el dispositivo
- 🖱️ Navegación con clicks en los laterales
- 🔎 Control de zoom y ajuste automático
- 📺 Modo pantalla completa

## Instalación

1. Clona o descarga el proyecto
2. Coloca tus archivos PDF en la carpeta `assets/comics/`

## Uso

### Opción 1: Servidor Python
```bash
python server.py
```

### Opción 2: Servidor HTTP simple
```bash
python -m http.server 8000
```

Luego abre tu navegador en `http://localhost:8000`

## Controles

### Teclado
- `←` / `→` - Página anterior/siguiente
- `Ctrl/Cmd + +/-` - Zoom in/out
- `Ctrl/Cmd + 0` - Zoom 100%
- `Ctrl/Cmd + F` - Ajustar a página
- `F11` - Pantalla completa

### Mouse/Touch
- Click izquierdo del canvas - Página anterior
- Click derecho del canvas - Página siguiente
- Botones de la barra de herramientas

## Estructura

```
comic-reader-webapp/
├── index.html           # Página principal
├── assets/
│   ├── comics/         # Coloca aquí tus PDFs
│   └── styles/         # Estilos CSS
├── src/
│   ├── app.js          # Lógica principal
│   └── api-client.js   # Cliente API
└── server.py           # Servidor opcional
```