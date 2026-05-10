import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgBackground = `<svg width="2732" height="2732" viewBox="0 0 2732 2732" fill="#1A1A2E" xmlns="http://www.w3.org/2000/svg">
<rect width="2732" height="2732" fill="#1A1A2E"/>
<g transform="translate(866, 866) scale(41.66)">
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="#D4A843" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M17 3 L17.5 4.5 L19 5 L17.5 5.5 L17 7 L16.5 5.5 L15 5 L16.5 4.5 Z" fill="#D4A843" />
</g>
</svg>`;

const svgIconRect = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="#1A1A2E" xmlns="http://www.w3.org/2000/svg">
<rect width="1024" height="1024" fill="#1A1A2E"/>
<g transform="translate(112, 112) scale(33.33)">
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="#D4A843" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M17 3 L17.5 4.5 L19 5 L17.5 5.5 L17 7 L16.5 5.5 L15 5 L16.5 4.5 Z" fill="#D4A843" />
</g>
</svg>`;

async function run() {
  if (!fs.existsSync('assets')) fs.mkdirSync('assets');
  await sharp(Buffer.from(svgBackground)).png().toFile('assets/splash.png');
  await sharp(Buffer.from(svgBackground)).png().toFile('assets/splash-dark.png');
  await sharp(Buffer.from(svgIconRect)).png().toFile('assets/icon.png');
  await sharp(Buffer.from(svgIconRect)).png().toFile('assets/logo.png');
  console.log('Assets generated successfully!');
}
run();
