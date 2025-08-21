@echo off
echo ========================================
echo    COMIC READER - SERVIDOR WEB
echo ========================================
echo.
echo Iniciando servidor en puerto 8000...
echo.
echo ACCEDE DESDE:
echo -------------
echo PC LOCAL: http://localhost:8000/index-mobile.html
echo MOVIL/TABLET (misma red WiFi): http://192.168.0.127:8000/index-mobile.html
echo.
echo ========================================
echo Presiona Ctrl+C para detener el servidor
echo ========================================
echo.

python -m http.server 8000 --bind 0.0.0.0