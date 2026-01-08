# Generar Iconos PWA

Tu versión de Node.js (v24.11.1) puede no ser compatible con sharp.

## Opción 1: Usar Node.js LTS
1. Instala Node.js 20 LTS desde https://nodejs.org
2. Ejecuta: npm install sharp --save-dev
3. Ejecuta: npm run generate:icons

## Opción 2: Usar herramienta online
1. Ve a https://realfavicongenerator.net
2. Sube el archivo: public/icons/icon-base.svg
3. Descarga el paquete de iconos
4. Copia los iconos a public/icons/

## Opción 3: Usar Figma/Canva
1. Importa icon-base.svg
2. Exporta en los tamaños: 16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512
3. Nombra como: icon-{size}x{size}.png