# Comic Reader - Despliegue en Netlify

Aplicación web progresiva (PWA) para leer historietas PDF, optimizada para Netlify.

## 🚀 Deploy en Netlify

### Método 1: GitHub Integration
1. Sube el proyecto a GitHub
2. Conecta tu repositorio en [Netlify](https://netlify.com)
3. Deploy automático

### Método 2: Drag & Drop
1. Arrastra la carpeta del proyecto a Netlify
2. Deploy instantáneo

## 📱 Características PWA

- ✅ **Instalable** en móvil y desktop
- ✅ **Funciona offline** después de la primera carga
- ✅ **Optimizada** para todos los dispositivos
- ✅ **Navegación táctil** (toca lados para cambiar página)
- ✅ **Almacenamiento local** de PDFs

## 🎯 Funcionalidades

### Navegación
- **Móvil**: Toca los lados de la página para navegar
- **Desktop**: Usa flechas del teclado o botones
- **Zoom**: Pellizco en móvil, Ctrl+/- en desktop

### Almacenamiento
- Los PDFs se guardan en el navegador (localStorage)
- No se pierden al cerrar la app
- Máximo ~5MB por PDF (limitación del navegador)

## 🔧 Configuración

### Iconos PWA
Para completar la PWA, agrega iconos en `/icons/`:
- 72x72, 96x96, 128x128, 144x144
- 152x152, 192x192, 384x384, 512x512

### Variables de entorno (opcional)
```
# Netlify Environment Variables
NODE_VERSION=18
```

## 📂 Estructura optimizada para Netlify

```
/
├── index.html           # Página principal
├── manifest.json        # PWA manifest
├── sw.js               # Service worker
├── netlify.toml        # Configuración Netlify
├── _redirects          # Redirects SPA
├── assets/
│   └── styles/         # CSS
├── src/
│   ├── app.js          # Lógica principal
│   └── api-client.js   # Cliente API
└── icons/              # Iconos PWA
```

## 🌐 URL de ejemplo
Después del deploy, tu app estará disponible en:
`https://tu-app-name.netlify.app`

## 💡 Características específicas de Netlify

- **SPA routing**: Configurado con `_redirects`
- **Headers de seguridad**: Configurados en `netlify.toml`
- **Cache optimizado**: Assets con cache de 1 año
- **PWA**: Service worker para funcionamiento offline