const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const splashScreens = [
  { width: 2048, height: 2732, name: 'apple-splash-2048-2732.png' },
  { width: 1668, height: 2388, name: 'apple-splash-1668-2388.png' },
  { width: 1536, height: 2048, name: 'apple-splash-1536-2048.png' },
  { width: 1125, height: 2436, name: 'apple-splash-1125-2436.png' },
  { width: 1242, height: 2688, name: 'apple-splash-1242-2688.png' },
  { width: 828, height: 1792, name: 'apple-splash-828-1792.png' },
  { width: 1170, height: 2532, name: 'apple-splash-1170-2532.png' },
  { width: 1179, height: 2556, name: 'apple-splash-1179-2556.png' },
];

const outputDir = path.join(__dirname, '../public/splash');

async function generateSplash() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const screen of splashScreens) {
    // Crear imagen con fondo degradado y logo centrado
    const svg = `
      <svg width="${screen.width}" height="${screen.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0f172a"/>
            <stop offset="100%" style="stop-color:#1e293b"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <text 
          x="50%" 
          y="45%" 
          text-anchor="middle" 
          fill="#3b82f6" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="${screen.width * 0.15}" 
          font-weight="bold"
        >L</text>
        <text 
          x="50%" 
          y="55%" 
          text-anchor="middle" 
          fill="white" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="${screen.width * 0.05}" 
          font-weight="500"
        >LifeOS</text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(outputDir, screen.name));
    
    console.log(`Generated: ${screen.name}`);
  }
}

generateSplash().catch(console.error);