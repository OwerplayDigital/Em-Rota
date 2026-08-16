import fs from 'node:fs';
import { createCanvas } from 'canvas';

// Configurações
const size = 1024;
const padding = size * 0.15;
const innerSize = size - padding * 2;
const primaryColor = '#1D4ED8'; // Azul Elétrico (estimado do oklch(0.55 0.22 264))
const deepBlue = '#0A192F';    // Azul Profundo (estimado do oklch(0.20 0.04 260))

// Cores reais do sistema (convertidas de oklch para hex aproximado)
// --primary: oklch(0.55 0.22 264) -> #3b82f6 approx
// --sidebar/deep: oklch(0.20 0.04 260) -> #1e293b approx
const COLORS = {
  electric: '#3b82f6',
  deep: '#1e293b',
  bg: '#f8fafc'
};

function drawIcon(ctx, s) {
  const p = s * 0.2;
  const w = s - p * 2;
  const h = s - p * 2;
  const cx = s / 2;
  const cy = s / 2;

  // Símbolo: "Ponta de seta moderna / Rota dinâmica"
  // Uma forma abstrata que sugere movimento e direção.
  // Combinação de uma linha de rota que se transforma em uma seta de direção.

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. A Rota (Linha curva de fundo)
  ctx.beginPath();
  ctx.moveTo(p + w * 0.2, p + h * 0.8);
  ctx.bezierCurveTo(
    p + w * 0.5, p + h * 0.8,
    p + w * 0.2, p + h * 0.2,
    p + w * 0.8, p + h * 0.2
  );
  ctx.strokeStyle = COLORS.electric;
  ctx.lineWidth = s * 0.12;
  ctx.stroke();

  // 2. O Indicador de Direção (Seta minimalista)
  ctx.beginPath();
  const arrowSize = s * 0.25;
  const ax = p + w * 0.8;
  const ay = p + h * 0.2;
  
  ctx.moveTo(ax - arrowSize, ay - arrowSize * 0.4);
  ctx.lineTo(ax, ay);
  ctx.lineTo(ax - arrowSize, ay + arrowSize * 0.4);
  
  ctx.strokeStyle = COLORS.deep;
  ctx.lineWidth = s * 0.12;
  ctx.stroke();
}

function generate(filePath, s, transparent = false) {
  const canvas = createCanvas(s, s);
  const ctx = canvas.getContext('2d');

  if (!transparent) {
    // Fundo premium (Azul Profundo ou Branco dependendo do uso)
    // Para App Icon, usamos o Azul Profundo do sistema
    ctx.fillStyle = COLORS.deep;
    ctx.fillRect(0, 0, s, s);
    
    // Ajustar cores para fundo escuro
    const originalDeep = COLORS.deep;
    COLORS.deep = '#ffffff'; 
    drawIcon(ctx, s);
    COLORS.deep = originalDeep;
  } else {
    drawIcon(ctx, s);
  }

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filePath, buffer);
  console.log(`Generated ${filePath} (${s}x${s})`);
}

// Criar diretório se não existir
if (!fs.existsSync('public/icons')) {
  fs.mkdirSync('public/icons', { recursive: true });
}

// Gerar variações
generate('public/icons/icon-192x192.png', 192);
generate('public/icons/icon-512x512.png', 512);
generate('public/apple-touch-icon.png', 180);
generate('public/favicon.png', 32, true);
