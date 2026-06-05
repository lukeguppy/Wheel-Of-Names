/**
 * NameWheel - Visual Skins Library
 * Procedural HTML5 Canvas Rendering for 30 Distinct Themes
 */

const SKIN_LIST = [
  { id: 'classic', name: '🎡 Original Segments' },
  { id: 'beach_ball', name: '🏖️ Beach Ball' },
  { id: 'cookie', name: '🍪 Chocolate Chip Cookie' },
  { id: 'donut', name: '🍩 Frosted Donut' },
  { id: 'pizza', name: '🍕 Pepperoni Pizza' },
  { id: 'poker_chip', name: '🪙 Poker Chip' },
  { id: 'target', name: '🎯 Target Dartboard' },
  { id: 'yin_yang', name: '☯️ Yin-Yang' },
  { id: 'clock', name: '⏰ Wall Clock' },
  { id: 'radar', name: '🟢 Radar Scanner' },
  { id: 'soccer_ball', name: '⚽ Football' },
  { id: 'basketball', name: '🏀 Basketball' },
  { id: 'baseball', name: '⚾ Baseball' },
  { id: 'sushi_roll', name: '🍣 Sushi Roll' },
  { id: 'vinyl_record', name: '🎛️ Vinyl Record' },
  { id: 'candy_swirl', name: '🍬 Peppermint Swirl' },
  { id: 'orange_slice', name: '🍊 Orange Wedge' },
  { id: 'watermelon', name: '🍉 Watermelon slice' },
  { id: 'wood_log', name: '🪵 Concentric Wood Log' },
  { id: 'compass_rose', name: '🧭 Compass Star' },
  { id: 'spiral_galaxy', name: '🌌 Spiral Nebula' },
  { id: 'retro_arcade', name: '🕹️ Retro Neon Grid' },
  { id: 'gold_coin', name: '🪙 Golden Doubloon' },
  { id: 'car_tire', name: '🛞 Rubber Tire' },
  { id: 'cyber_circuit', name: '⚡ Cyber Circuit' },
  { id: 'candy_cane', name: '💈 Candy Cane Stripe' },
  { id: 'kiwi_fruit', name: '🥝 Kiwi Wedge' },
  { id: 'shield_crest', name: '🛡️ Shield Crest' },
  { id: 'spider_web', name: '🕸️ Spider Web' },
  { id: 'disco_ball', name: '🪩 Mirror Disco Ball' }
];

// Pre-calculated coordinates for rotating details (seeds, chips, sprinkles)
const COOKIE_CHIPS = [
  { r: 0.35, a: 0.4 }, { r: 0.65, a: 1.1 }, { r: 0.50, a: 2.1 },
  { r: 0.72, a: 2.9 }, { r: 0.38, a: 3.7 }, { r: 0.68, a: 4.4 },
  { r: 0.54, a: 5.1 }, { r: 0.76, a: 5.9 }, { r: 0.28, a: 2.5 }
];

const DONUT_SPRINKLES = [
  { r: 0.55, a: 0.3, c: '#ff007f', rot: 0.2 }, { r: 0.72, a: 0.8, c: '#ffca3a', rot: -0.6 },
  { r: 0.62, a: 1.4, c: '#00f5d4', rot: 0.9 }, { r: 0.50, a: 2.0, c: '#1982c4', rot: -0.1 },
  { r: 0.75, a: 2.6, c: '#ff9f1c', rot: 1.1 }, { r: 0.58, a: 3.2, c: '#ffffff', rot: 0.4 },
  { r: 0.68, a: 3.8, c: '#ff007f', rot: -0.3 }, { r: 0.52, a: 4.3, c: '#00f5d4', rot: 0.7 },
  { r: 0.70, a: 4.9, c: '#ffca3a', rot: -0.8 }, { r: 0.60, a: 5.5, c: '#1982c4', rot: 0.5 },
  { r: 0.76, a: 6.0, c: '#ffffff', rot: 1.3 }, { r: 0.48, a: 1.0, c: '#ffca3a', rot: -0.4 }
];

const WATERMELON_SEEDS = [
  0.2, 0.7, 1.2, 1.8, 2.3, 2.8, 3.4, 3.9, 4.4, 5.0, 5.5, 6.1
];

// Helper to draw standard wedges (fallback / baseline)
function drawStandardWedges(ctx, center, radius, segmentsCount, currentAngle, colors) {
  const arcSize = (Math.PI * 2) / segmentsCount;
  for (let i = 0; i < segmentsCount; i++) {
    const startAngle = i * arcSize + currentAngle;
    const endAngle = startAngle + arcSize;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
  }
}

const SKINS_DRAWERS = {
  classic: (ctx, center, radius, segmentsCount, currentAngle, colors) => {
    drawStandardWedges(ctx, center, radius, segmentsCount, currentAngle, colors);
  },

  beach_ball: (ctx, center, radius, segmentsCount, currentAngle, colors) => {
    // Alternating bright beach-ball curved wedges: White, Red, Blue, Yellow, Green
    const ballColors = ['#ffffff', '#ff3b30', '#007aff', '#ffcc00', '#4cd964'];
    const arcSize = (Math.PI * 2) / segmentsCount;
    for (let i = 0; i < segmentsCount; i++) {
      const startAngle = i * arcSize + currentAngle;
      const endAngle = startAngle + arcSize;
      
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = ballColors[i % ballColors.length];
      ctx.fill();
    }
  },

  cookie: (ctx, center, radius, segmentsCount, currentAngle) => {
    // 1. Draw golden brown cookie base
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(center, center, radius * 0.2, center, center, radius);
    grad.addColorStop(0, '#e6b87d');
    grad.addColorStop(0.8, '#d4a35c');
    grad.addColorStop(1, '#b07f38');
    ctx.fillStyle = grad;
    ctx.fill();

    // 2. Draw chocolate chips rotating with currentAngle
    COOKIE_CHIPS.forEach(chip => {
      const angle = chip.a + currentAngle;
      const chipX = center + Math.cos(angle) * (radius * chip.r);
      const chipY = center + Math.sin(angle) * (radius * chip.r);
      
      ctx.beginPath();
      ctx.arc(chipX, chipY, radius * 0.08, 0, Math.PI * 2);
      ctx.fillStyle = '#42250f'; // Dark chocolate
      ctx.fill();
      
      // Chip highlight
      ctx.beginPath();
      ctx.arc(chipX - radius * 0.02, chipY - radius * 0.02, radius * 0.02, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fill();
    });
  },

  donut: (ctx, center, radius, segmentsCount, currentAngle) => {
    // 1. Donut dough base
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#e9c46a';
    ctx.fill();
    
    // 2. Pink strawberry frosting overlay (slightly smaller, wavy edge)
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.05) {
      // Wave radius to look like organic dripping icing
      const wave = Math.sin(a * 10) * (radius * 0.04);
      const r = radius * 0.85 + wave;
      const x = center + Math.cos(a) * r;
      const y = center + Math.sin(a) * r;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = '#ffb5a7'; // Pink frosting
    ctx.fill();

    // Inner shadow for frosting
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#e9c46a'; // Reveal dough in the center
    ctx.fill();

    // 3. Draw colorful sprinkles
    DONUT_SPRINKLES.forEach(sp => {
      const angle = sp.a + currentAngle;
      const spX = center + Math.cos(angle) * (radius * sp.r);
      const spY = center + Math.sin(angle) * (radius * sp.r);
      
      ctx.save();
      ctx.translate(spX, spY);
      ctx.rotate(angle + sp.rot);
      ctx.fillStyle = sp.c;
      ctx.beginPath();
      ctx.roundRect(-radius*0.06, -radius*0.015, radius*0.12, radius*0.03, radius*0.015);
      ctx.fill();
      ctx.restore();
    });
  },

  pizza: (ctx, center, radius, segmentsCount, currentAngle) => {
    // 1. Draw Golden Crust
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#df9f32';
    ctx.fill();

    // Sauce + Cheese filling
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.88, 0, Math.PI * 2);
    ctx.fillStyle = '#f4d35e'; // Cheese yellow
    ctx.strokeStyle = '#c1272d'; // Sauce red ring
    ctx.lineWidth = radius * 0.04;
    ctx.fill();
    ctx.stroke();

    // 2. Pepperoni circles in each slice segment
    const arcSize = (Math.PI * 2) / segmentsCount;
    for (let i = 0; i < segmentsCount; i++) {
      const startAngle = i * arcSize + currentAngle;
      const midAngle = startAngle + arcSize / 2;
      
      // Draw pepperoni slices along the radial slice
      const pepDists = [0.4, 0.7];
      pepDists.forEach(dist => {
        const pepX = center + Math.cos(midAngle) * (radius * dist);
        const pepY = center + Math.sin(midAngle) * (radius * dist);
        
        ctx.beginPath();
        ctx.arc(pepX, pepY, radius * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = '#990000'; // Pepperoni red
        ctx.strokeStyle = '#660000';
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
      });
    }
  },

  poker_chip: (ctx, center, radius, segmentsCount, currentAngle) => {
    // Draw classic Casino Poker chip
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#1e2022';
    ctx.fill();

    // Red outer dashes
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(currentAngle);
    ctx.strokeStyle = '#d63031';
    ctx.lineWidth = radius * 0.08;
    ctx.setLineDash([radius * 0.1, radius * 0.15]);
    ctx.beginPath();
    ctx.arc(0, 0, radius - radius * 0.04, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // White inner ring
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.78, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = radius * 0.02;
    ctx.stroke();

    // Black center filling
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.70, 0, Math.PI * 2);
    ctx.fillStyle = '#2d3436';
    ctx.fill();
  },

  target: (ctx, center, radius) => {
    // Dartboard / archery target: concentric circles
    const colors = ['#e63946', '#2d3436', '#457b9d', '#ffd166', '#ffffff'];
    for (let i = 0; i < 5; i++) {
      const r = radius - (i * radius * 0.18);
      ctx.beginPath();
      ctx.arc(center, center, r, 0, Math.PI * 2);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  },

  yin_yang: (ctx, center, radius, segmentsCount, currentAngle) => {
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(currentAngle);

    // Large circle base
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Black half
    ctx.beginPath();
    ctx.arc(0, 0, radius, -Math.PI/2, Math.PI/2);
    ctx.fillStyle = '#1e1b4b';
    ctx.fill();

    // Interlocking curves
    ctx.beginPath();
    ctx.arc(0, radius/2, radius/2, 0, Math.PI * 2);
    ctx.fillStyle = '#1e1b4b';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -radius/2, radius/2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Small contrast dots
    ctx.beginPath();
    ctx.arc(0, radius/2, radius * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -radius/2, radius * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = '#1e1b4b';
    ctx.fill();

    ctx.restore();
  },

  clock: (ctx, center, radius, segmentsCount, currentAngle) => {
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Clock hour marks
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(currentAngle);
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 4;
    for (let i = 0; i < 12; i++) {
      ctx.rotate(Math.PI / 6);
      ctx.beginPath();
      ctx.moveTo(radius - 15, 0);
      ctx.lineTo(radius - 2, 0);
      ctx.stroke();
    }
    ctx.restore();
  },

  radar: (ctx, center, radius, segmentsCount, currentAngle) => {
    // Dark green radar background
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#06200f';
    ctx.fill();
    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Concentric grid rings
    ctx.strokeStyle = 'rgba(0, 255, 102, 0.25)';
    ctx.lineWidth = 1;
    [0.25, 0.50, 0.75].forEach(pct => {
      ctx.beginPath();
      ctx.arc(center, center, radius * pct, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Spinning Radar Sweep gradient line
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(currentAngle);
    
    const sweepGrad = ctx.createRadialGradient(0, 0, radius * 0.1, 0, 0, radius);
    sweepGrad.addColorStop(0, 'rgba(0, 255, 102, 0.4)');
    sweepGrad.addColorStop(1, 'rgba(0, 255, 102, 0)');
    
    // Draw sweep segment
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, 0, Math.PI / 4);
    ctx.closePath();
    ctx.fillStyle = sweepGrad;
    ctx.fill();

    // Grid cross axes
    ctx.strokeStyle = 'rgba(0, 255, 102, 0.15)';
    ctx.beginPath();
    ctx.moveTo(-radius, 0); ctx.lineTo(radius, 0);
    ctx.moveTo(0, -radius); ctx.lineTo(0, radius);
    ctx.stroke();
    
    ctx.restore();
  },

  soccer_ball: (ctx, center, radius, segmentsCount, currentAngle) => {
    // 1. Off-white sphere base
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#f5f6fa';
    ctx.fill();

    // 2. Rotating panel details
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(currentAngle);
    
    // Draw pentagon helper
    function drawPent(cx, cy, r, rotAngle) {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = rotAngle + (i * Math.PI * 2) / 5;
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fillStyle = '#1e272e';
      ctx.fill();
      ctx.strokeStyle = '#dcdde1';
      ctx.lineWidth = radius * 0.015;
      ctx.stroke();
    }

    const rP = radius * 0.20;
    // Center pentagon
    drawPent(0, 0, rP, -Math.PI / 2);

    // 5 Outer pentagons
    const outerDist = radius * 0.65;
    const rOuter = radius * 0.18;
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const px = Math.cos(a) * outerDist;
      const py = Math.sin(a) * outerDist;
      drawPent(px, py, rOuter, a + Math.PI);

      // Connecting seams (inner pentagon vertices to outer pentagon vertices)
      const vInnerX = Math.cos(a) * rP;
      const vInnerY = Math.sin(a) * rP;
      const vOuterX = px + Math.cos(a + Math.PI) * rOuter;
      const vOuterY = py + Math.sin(a + Math.PI) * rOuter;

      ctx.beginPath();
      ctx.moveTo(vInnerX, vInnerY);
      ctx.lineTo(vOuterX, vOuterY);
      ctx.strokeStyle = '#1e272e';
      ctx.lineWidth = radius * 0.02;
      ctx.stroke();

      // Connecting lines between neighboring outer pentagons
      const nextA = (((i + 1) % 5) * Math.PI * 2) / 5 - Math.PI / 2;
      const nextPx = Math.cos(nextA) * outerDist;
      const nextPy = Math.sin(nextA) * outerDist;

      const p1_vertex_a = a + Math.PI + (Math.PI * 2) / 5;
      const p1_x = px + Math.cos(p1_vertex_a) * rOuter;
      const p1_y = py + Math.sin(p1_vertex_a) * rOuter;

      const p2_vertex_a = nextA + Math.PI - (Math.PI * 2) / 5;
      const p2_x = nextPx + Math.cos(p2_vertex_a) * rOuter;
      const p2_y = nextPy + Math.sin(p2_vertex_a) * rOuter;

      ctx.beginPath();
      ctx.moveTo(p1_x, p1_y);
      ctx.lineTo(p2_x, p2_y);
      ctx.strokeStyle = '#1e272e';
      ctx.lineWidth = radius * 0.02;
      ctx.stroke();
    }
    ctx.restore();

    // 3. Stationary 3D Spherical Shading overlay
    const shGrad = ctx.createRadialGradient(
      center - radius * 0.25, center - radius * 0.25, radius * 0.1,
      center, center, radius
    );
    shGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    shGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.05)');
    shGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0.3)');
    shGrad.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = shGrad;
    ctx.fill();
  },

  basketball: (ctx, center, radius, segmentsCount, currentAngle) => {
    // Orange basketball base
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    const bGrad = ctx.createRadialGradient(center, center, radius*0.3, center, center, radius);
    bGrad.addColorStop(0, '#f97f1f');
    bGrad.addColorStop(1, '#d35400');
    ctx.fillStyle = bGrad;
    ctx.fill();
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Seams rotating with wheel
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(currentAngle);
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 4;
    
    // Cross seams
    ctx.beginPath();
    ctx.moveTo(-radius, 0); ctx.lineTo(radius, 0);
    ctx.moveTo(0, -radius); ctx.lineTo(0, radius);
    ctx.stroke();

    // Side curved seams
    ctx.beginPath();
    ctx.arc(-radius, 0, radius * 0.72, -Math.PI/3, Math.PI/3);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(radius, 0, radius * 0.72, Math.PI - Math.PI/3, Math.PI + Math.PI/3);
    ctx.stroke();

    ctx.restore();
  },

  baseball: (ctx, center, radius, segmentsCount, currentAngle) => {
    // 1. Base leather sphere
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fbfaf7'; // Slightly off-white leather
    ctx.fill();

    // 2. Rotating stitches & seams
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(currentAngle);

    // Left seam line
    const cx1 = -radius * 0.65;
    const r1 = radius * 0.72;
    ctx.beginPath();
    ctx.arc(cx1, 0, r1, -Math.PI / 3, Math.PI / 3);
    ctx.strokeStyle = '#c23616';
    ctx.lineWidth = radius * 0.015;
    ctx.stroke();

    // Left V-stitches along seam 1
    ctx.strokeStyle = '#b22222';
    ctx.lineWidth = radius * 0.01;
    for (let a = -Math.PI / 3; a <= Math.PI / 3; a += 0.05) {
      const sx = cx1 + Math.cos(a) * r1;
      const sy = Math.sin(a) * r1;
      const normalAngle = a;
      const stitchLen = radius * 0.025;
      const angleSpread = 0.6;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(normalAngle - angleSpread) * stitchLen, sy + Math.sin(normalAngle - angleSpread) * stitchLen);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(normalAngle + angleSpread) * stitchLen, sy + Math.sin(normalAngle + angleSpread) * stitchLen);
      ctx.stroke();
    }

    // Right seam line
    const cx2 = radius * 0.65;
    const r2 = radius * 0.72;
    ctx.beginPath();
    ctx.arc(cx2, 0, r2, Math.PI - Math.PI / 3, Math.PI + Math.PI / 3);
    ctx.strokeStyle = '#c23616';
    ctx.lineWidth = radius * 0.015;
    ctx.stroke();

    // Right V-stitches along seam 2
    for (let a = Math.PI - Math.PI / 3; a <= Math.PI + Math.PI / 3; a += 0.05) {
      const sx = cx2 + Math.cos(a) * r2;
      const sy = Math.sin(a) * r2;
      const normalAngle = a;
      const stitchLen = radius * 0.025;
      const angleSpread = 0.6;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(normalAngle - angleSpread) * stitchLen, sy + Math.sin(normalAngle - angleSpread) * stitchLen);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(normalAngle + angleSpread) * stitchLen, sy + Math.sin(normalAngle + angleSpread) * stitchLen);
      ctx.stroke();
    }

    ctx.restore();

    // 3. Stationary 3D Spherical Shading overlay
    const shGrad = ctx.createRadialGradient(
      center - radius * 0.25, center - radius * 0.25, radius * 0.1,
      center, center, radius
    );
    shGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    shGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.05)');
    shGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0.25)');
    shGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = shGrad;
    ctx.fill();
  },

  sushi_roll: (ctx, center, radius, segmentsCount, currentAngle) => {
    // Outer seaweed ring
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0f1b15';
    ctx.fill();

    // Rice center
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.86, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Sushi core wedges (Salmon / Avocado / Egg)
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(currentAngle);
    const coreColors = ['#ff7a45', '#73d13d', '#ffec3d'];
    const rC = radius * 0.44;
    for (let i = 0; i < 3; i++) {
      const sAngle = (i * Math.PI * 2) / 3;
      const eAngle = sAngle + (Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, rC, sAngle, eAngle);
      ctx.closePath();
      ctx.fillStyle = coreColors[i];
      ctx.fill();
    }
    ctx.restore();
  },

  vinyl_record: (ctx, center, radius, segmentsCount, currentAngle) => {
    // 1. Vinyl base
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a0a';
    ctx.fill();

    // Concentric grooves
    ctx.strokeStyle = '#1e1e1e';
    ctx.lineWidth = 1.5;
    [0.4, 0.48, 0.56, 0.64, 0.72, 0.8, 0.88, 0.94].forEach(p => {
      ctx.beginPath();
      ctx.arc(center, center, radius * p, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Record Center label
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.32, 0, Math.PI * 2);
    ctx.fillStyle = '#ff007f';
    ctx.fill();
  },

  candy_swirl: (ctx, center, radius, segmentsCount, currentAngle) => {
    // Peppermint swirl
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(currentAngle);
    ctx.fillStyle = '#ff2a2a';
    
    // Draw 12 curved peppermint arcs
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      // Swept arc boundary
      ctx.bezierCurveTo(radius * 0.4, radius * 0.2, radius * 0.6, radius * 0.6, radius, 0);
      ctx.rotate(Math.PI / 6);
      ctx.lineTo(radius, 0);
      ctx.bezierCurveTo(radius * 0.6, radius * 0.6, radius * 0.4, radius * 0.2, 0, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  },

  orange_slice: (ctx, center, radius, segmentsCount, currentAngle) => {
    // Orange skin border
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffa502';
    ctx.fill();

    // White inner rind
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.94, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Citrus wedges
    const sliceCount = 8;
    const sArc = (Math.PI * 2) / sliceCount;
    for (let i = 0; i < sliceCount; i++) {
      const sAngle = i * sArc + currentAngle + 0.05;
      const eAngle = (i + 1) * sArc + currentAngle - 0.05;
      
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius * 0.88, sAngle, eAngle);
      ctx.closePath();
      ctx.fillStyle = '#ff7f50';
      ctx.fill();
    }
  },

  watermelon: (ctx, center, radius, segmentsCount, currentAngle) => {
    // 1. Watermelon green rind
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#2ed573';
    ctx.fill();

    // 2. White rind core layer
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.92, 0, Math.PI * 2);
    ctx.fillStyle = '#f1f2f6';
    ctx.fill();

    // 3. Pink watermelon flesh
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.86, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4757';
    ctx.fill();

    // 4. Black seeds rotating
    WATERMELON_SEEDS.forEach(sd => {
      const angle = sd + currentAngle;
      const sdX = center + Math.cos(angle) * (radius * 0.55);
      const sdY = center + Math.sin(angle) * (radius * 0.55);
      
      ctx.beginPath();
      ctx.arc(sdX, sdY, radius * 0.024, 0, Math.PI * 2);
      ctx.fillStyle = '#2f3542';
      ctx.fill();
    });
  },

  wood_log: (ctx, center, radius) => {
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#8c6239'; // Bark
    ctx.fill();

    // Concentric growth rings
    ctx.strokeStyle = '#5c3a21';
    [0.18, 0.32, 0.46, 0.60, 0.74, 0.88].forEach((p, idx) => {
      ctx.beginPath();
      ctx.arc(center, center, radius * p, 0, Math.PI * 2);
      ctx.fillStyle = idx % 2 === 0 ? '#b08b5c' : '#c6a47a';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });
  },

  compass_rose: (ctx, center, radius, segmentsCount, currentAngle) => {
    // Paper card background
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#f7f1e3';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(currentAngle);
    
    // Draw 8-pointed star compass
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      // Gold right half
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(radius * 0.85, 0);
      ctx.lineTo(radius * 0.15, radius * 0.15);
      ctx.closePath();
      ctx.fillStyle = '#ffb142';
      ctx.fill();

      // Dark left half
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(radius * 0.85, 0);
      ctx.lineTo(radius * 0.15, -radius * 0.15);
      ctx.closePath();
      ctx.fillStyle = '#474787';
      ctx.fill();
    }
    ctx.restore();
  },

  spiral_galaxy: (ctx, center, radius, segmentsCount, currentAngle) => {
    // Deep space
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0b0813';
    ctx.fill();

    // Spiral arms gradients
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(currentAngle);

    ctx.globalCompositeOperation = 'screen';
    for (let a = 0; a < 2; a++) {
      ctx.rotate(Math.PI);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let t = 0; t <= 10; t += 0.2) {
        const r = radius * (t / 10);
        const theta = t * 0.5;
        const x = Math.cos(theta) * r;
        const y = Math.sin(theta) * r;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = a === 0 ? '#ff007f' : '#7b2cbf';
      ctx.lineWidth = radius * 0.15;
      ctx.stroke();
    }
    ctx.restore();
  },

  retro_arcade: (ctx, center, radius, segmentsCount, currentAngle) => {
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0d0d1a';
    ctx.fill();

    // Radial grids
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(currentAngle);
    ctx.strokeStyle = 'rgba(0, 245, 212, 0.25)';
    ctx.lineWidth = 1;

    for (let i = 0; i < 16; i++) {
      ctx.rotate(Math.PI / 8);
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.lineTo(radius, 0);
      ctx.stroke();
    }

    // Concentric squares
    ctx.strokeStyle = 'rgba(255, 0, 127, 0.3)';
    [0.2, 0.4, 0.6, 0.8].forEach(p => {
      const dim = radius * p * 2;
      ctx.strokeRect(-dim/2, -dim/2, dim, dim);
    });

    ctx.restore();
  },

  gold_coin: (ctx, center, radius) => {
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(center, center, radius * 0.15, center, center, radius);
    grad.addColorStop(0, '#ffe566');
    grad.addColorStop(0.7, '#e6b800');
    grad.addColorStop(1, '#b38f00');
    ctx.fillStyle = grad;
    ctx.fill();

    // Coin Ridges rim
    ctx.strokeStyle = '#cc9900';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.92, 0, Math.PI * 2);
    ctx.stroke();
  },

  car_tire: (ctx, center, radius, segmentsCount, currentAngle) => {
    // Draw rubber tire
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#2f3542'; // Dark rubber
    ctx.fill();

    // Treads ticks along outer rim
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(currentAngle);
    ctx.strokeStyle = '#1e2229';
    ctx.lineWidth = radius * 0.08;
    ctx.setLineDash([radius * 0.05, radius * 0.06]);
    ctx.beginPath();
    ctx.arc(0, 0, radius - radius*0.04, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();

    // Inner rim
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.58, 0, Math.PI * 2);
    ctx.fillStyle = '#747d8c'; // Silver metal wheel
    ctx.fill();
    ctx.strokeStyle = '#57606f';
    ctx.lineWidth = 2;
    ctx.stroke();
  },

  cyber_circuit: (ctx, center, radius, segmentsCount, currentAngle) => {
    // Circuit Board dark green base
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0d2b18';
    ctx.fill();
    
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(currentAngle);
    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 2;

    // Draw some radial circuit board lines
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(radius * 0.2, 0);
      ctx.lineTo(radius * 0.5, 0);
      ctx.lineTo(radius * 0.6, radius * 0.1);
      ctx.lineTo(radius * 0.85, radius * 0.1);
      ctx.stroke();

      // Nodes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(radius * 0.85, radius * 0.1, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  candy_cane: (ctx, center, radius, segmentsCount, currentAngle) => {
    // Red-white candy stripe circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI*2);
    ctx.clip(); // Clip stripes inside wheel bounds

    ctx.translate(center, center);
    ctx.rotate(currentAngle);
    
    // Draw repeating striped pattern across the wheel
    ctx.strokeStyle = '#ff3838';
    ctx.lineWidth = radius * 0.18;
    for (let x = -radius * 1.5; x < radius * 1.5; x += radius * 0.36) {
      ctx.beginPath();
      ctx.moveTo(x, -radius);
      ctx.lineTo(x + radius * 0.5, radius);
      ctx.stroke();
    }
    ctx.restore();

    // Candy cane outer red border
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#d63031';
    ctx.lineWidth = 4;
    ctx.stroke();
  },

  kiwi_fruit: (ctx, center, radius, segmentsCount, currentAngle) => {
    // Kiwi brown fuzzy skin
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#8f6239';
    ctx.fill();

    // Kiwi green pulp inside
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.94, 0, Math.PI * 2);
    ctx.fillStyle = '#7bed9f';
    ctx.fill();

    // Center white core
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.24, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Kiwi black seeds radiating out
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(currentAngle);
    ctx.fillStyle = '#2f3542';
    for (let i = 0; i < 18; i++) {
      ctx.rotate(Math.PI / 9);
      ctx.beginPath();
      ctx.arc(radius * 0.42, 0, radius * 0.02, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  shield_crest: (ctx, center, radius, segmentsCount, currentAngle) => {
    // Quad divided heraldic crest background
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(currentAngle);

    // Large circle split into gold, blue, red, silver segments
    const crestColors = ['#ffcc00', '#007aff', '#ff3b30', '#dcdde1'];
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, (i * Math.PI) / 2, ((i + 1) * Math.PI) / 2);
      ctx.closePath();
      ctx.fillStyle = crestColors[i];
      ctx.fill();
    }
    ctx.restore();

    // Bronze inner shield border
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#8c7ae6';
    ctx.lineWidth = 5;
    ctx.stroke();
  },

  spider_web: (ctx, center, radius, segmentsCount, currentAngle) => {
    // Dark web background
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#1e272e';
    ctx.fill();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(currentAngle);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 1.2;

    // Draw spider web radial rays
    const rayCount = segmentsCount;
    const arcSize = (Math.PI * 2) / rayCount;
    for (let i = 0; i < rayCount; i++) {
      ctx.rotate(arcSize);
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.lineTo(radius, 0);
      ctx.stroke();

      // Connecting web loops
      [0.2, 0.4, 0.6, 0.8].forEach(p => {
        ctx.beginPath();
        ctx.arc(0, 0, radius * p, 0, arcSize);
        ctx.stroke();
      });
    }
    ctx.restore();
  },

  disco_ball: (ctx, center, radius, segmentsCount, currentAngle) => {
    // Mirror tiles drawing
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.clip(); // Clip grid to circle

    ctx.translate(center, center);
    ctx.rotate(currentAngle);
    
    // Draw reflective grid tiles
    const tileSize = radius * 0.16;
    for (let x = -radius; x < radius; x += tileSize) {
      for (let y = -radius; y < radius; y += tileSize) {
        // Pseudo-random shade of silver/grey
        const shade = Math.floor(180 + Math.sin(x * 0.2 + y * 0.3) * 60);
        ctx.fillStyle = `rgb(${shade}, ${shade + 10}, ${shade + 18})`;
        ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
      }
    }
    ctx.restore();

    // Metallic outer ring overlay
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
};

function drawWheelSkin(id, ctx, center, radius, segmentsCount, currentAngle, colors) {
  if (SKINS_DRAWERS[id]) {
    SKINS_DRAWERS[id](ctx, center, radius, segmentsCount, currentAngle, colors);
  } else {
    SKINS_DRAWERS.classic(ctx, center, radius, segmentsCount, currentAngle, colors);
  }
}
