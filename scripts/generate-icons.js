// Script para generar iconos PNG desde SVG usando canvas nativo de Node
// Si sharp no funciona, este script crea archivos placeholder
// Ejecutar con: npm run generate:icons

const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512];
const outputDir = path.join(__dirname, '../public/icons');

// Función para intentar usar sharp, si falla crear placeholders
async function generateIcons() {
  console.log('🎨 Generando iconos PWA...\n');
  
  // Asegurar que existe el directorio
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let sharp;
  try {
    sharp = require('sharp');
    console.log('✓ Sharp disponible, generando PNGs de alta calidad...\n');
    await generateWithSharp(sharp);
  } catch (e) {
    console.log('⚠ Sharp no disponible, copiando SVG como fallback...');
    console.log('  Para mejores iconos, instala sharp: npm install sharp\n');
    await generateFallback();
  }
}

async function generateWithSharp(sharp) {
  const inputSvg = path.join(__dirname, '../public/icons/icon-base.svg');
  
  for (const size of sizes) {
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
    console.log(`✓ icon-${size}x${size}.png`);
  }

  // Apple touch icon
  await sharp(inputSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(outputDir, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png');

  // Shortcuts
  const shortcuts = ['food', 'workout', 'task', 'voice'];
  for (const name of shortcuts) {
    const svgPath = path.join(outputDir, `shortcut-${name}.svg`);
    if (fs.existsSync(svgPath)) {
      await sharp(svgPath)
        .resize(96, 96)
        .png()
        .toFile(path.join(outputDir, `shortcut-${name}.png`));
      console.log(`✓ shortcut-${name}.png`);
    }
  }

  console.log('\n✅ Iconos generados correctamente!');
}

async function generateFallback() {
  // Sin sharp, simplemente aseguramos que el SVG existe y puede usarse como fallback
  // Los navegadores modernos pueden usar SVG como icono
  const svgContent = fs.readFileSync(path.join(outputDir, 'icon-base.svg'), 'utf8');
  
  // Crear un HTML que muestre instrucciones
  console.log('\n📋 Para generar los iconos PNG, necesitas:');
  console.log('   1. Usar una versión de Node.js compatible con sharp (v18 o v20 LTS)');
  console.log('   2. O usar una herramienta online como realfavicongenerator.net');
  console.log('   3. Subir el archivo: public/icons/icon-base.svg');
  console.log('\n   El SVG base está listo en: public/icons/icon-base.svg');
  
  // Crear archivo de instrucciones
  const instructions = `
# Generar Iconos PWA

Tu versión de Node.js (${process.version}) puede no ser compatible con sharp.

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
`;

  fs.writeFileSync(path.join(outputDir, 'GENERATE_ICONS.md'), instructions.trim());
  console.log('\n📄 Instrucciones guardadas en: public/icons/GENERATE_ICONS.md');
}

generateIcons().catch(console.error);
