// Game state
let gameState = 'MENU';
let currentLevelIndex = 0;
let cameraX = 0;
let levelTimer = 0;
let riemannHistory = [];
let energy = 0;
let riemannN = CONFIG.RIEMANN_N_DEFAULT;
let enemies = [];
let portalX = CONFIG.WORLD_WIDTH - 200;
let showMathPanel = true;
let menuXOffset = 0;
let paused = false;
let levelStats = [];
let collectedCriticals = 0;

function setup() {
  createCanvas(CONFIG.WIDTH, CONFIG.HEIGHT);
  textFont('monospace');
  frameRate(60);
}

function loadLevel(index) {
  currentLevelIndex = index;
  Terrain.build(index);
  Player.init();
  Enemies.build(index);
  riemannHistory = [];
  energy = 0;
  levelTimer = CONFIG.LEVEL_TIME * 60;
  cameraX = 0;
  collectedCriticals = 0;
}

function draw() {
  background(CONFIG.COLORS.BG);

  switch (gameState) {
    case 'MENU':         drawMenu();                  break;
    case 'INSTRUCTIONS': drawInstructions();           break;
    case 'PLAYING':      drawPlaying();                break;
    case 'LEVEL_COMPLETE': drawLevelCompleteScreen();  break;
    case 'GAME_OVER':    HUD.drawGameOver();           break;
    case 'WIN':          drawWinScreen();              break;
  }
}

// ─── MENU ────────────────────────────────────────────────────────────────────

function drawMenu() {
  menuXOffset += 0.4;

  // Animated sine wave background
  stroke('#1a3a6a');
  strokeWeight(2);
  noFill();
  beginShape();
  for (let sx = 0; sx <= CONFIG.WIDTH; sx += 3) {
    const wx = sx + menuXOffset;
    const y = CONFIG.HEIGHT * 0.6 - 60 * Math.sin(wx * 0.015) - 30 * Math.sin(wx * 0.03);
    vertex(sx, y);
  }
  endShape();

  // Title
  noStroke();
  textFont('monospace');
  textAlign(CENTER, CENTER);

  fill('#aa44ff');
  textSize(52);
  text('DERIVA', CONFIG.WIDTH / 2, 130);

  fill('#4a90d9');
  textSize(18);
  text('El Plano Ecuacional', CONFIG.WIDTH / 2, 180);

  fill(CONFIG.COLORS.HUD_TEXT);
  textSize(13);
  text('► Derivadas: la pendiente del terreno gobierna tu física', CONFIG.WIDTH / 2, 240);
  text('► Integral de Riemann: acumula energía para abrir portales', CONFIG.WIDTH / 2, 265);

  fill('#666688');
  textSize(12);
  text('Movimiento: A/D o ←/→   Salto: W/Espacio/↑   Panel: H', CONFIG.WIDTH / 2, 310);
  text('Subdivisiones N: [ ]', CONFIG.WIDTH / 2, 330);

  // Blinking prompt
  if (Math.floor(frameCount / 30) % 2 === 0) {
    fill('#ffffff');
    textSize(16);
    text('ENTER para comenzar', CONFIG.WIDTH / 2, 395);
  }
}

// ─── INSTRUCTIONS ────────────────────────────────────────────────────────────

function drawInstructions() {
  menuXOffset += 0.4;

  // Same animated wave as menu
  stroke('#1a3a6a');
  strokeWeight(2);
  noFill();
  beginShape();
  for (let sx = 0; sx <= CONFIG.WIDTH; sx += 3) {
    const wx = sx + menuXOffset;
    const y = CONFIG.HEIGHT * 0.6 - 60 * Math.sin(wx * 0.015) - 30 * Math.sin(wx * 0.03);
    vertex(sx, y);
  }
  endShape();

  // Header
  noStroke();
  textFont('monospace');
  textAlign(CENTER, TOP);
  fill('#aa44ff');
  textSize(22);
  text('CÓMO JUGAR', CONFIG.WIDTH / 2, 18);

  // Divider
  stroke('#333366');
  strokeWeight(1);
  line(40, 48, CONFIG.WIDTH - 40, 48);
  noStroke();

  const lh = 18;
  textAlign(LEFT, TOP);
  textSize(12);

  // ── Left column: Derivadas ──────────────────────────────────────────────────
  const lx = 44;
  let ly = 58;

  fill('#4a90d9');
  textSize(13);
  text('── DERIVADAS ──', lx, ly); ly += lh + 4;

  fill('#aaccff');
  textSize(11);
  text('El terreno es la función f(x).', lx, ly); ly += lh;
  text('Su pendiente f\'(x) afecta tu velocidad:', lx, ly); ly += lh + 4;

  fill('#ffdd44');
  text('f\'(x) > 0  ↗  pendiente sube', lx, ly); ly += lh;
  fill(CONFIG.COLORS.HUD_TEXT);
  text('   → frenas al trepar', lx, ly); ly += lh + 4;

  fill('#44ffaa');
  text('f\'(x) < 0  ↘  pendiente baja', lx, ly); ly += lh;
  fill(CONFIG.COLORS.HUD_TEXT);
  text('   → aceleras al descender', lx, ly); ly += lh + 4;

  fill('#aaccff');
  text('f\'(x) ≈ 0  →  PUNTO CRÍTICO', lx, ly); ly += lh + 2;

  fill('#ffdd44');
  text('  ★  f\'\'(x) < 0  →  máximo local', lx, ly); ly += lh;
  fill(CONFIG.COLORS.HUD_TEXT);
  text('     pisa la estrella: SUPER-SALTO', lx, ly); ly += lh + 4;

  fill('#44ffaa');
  text('  ◆  f\'\'(x) > 0  →  mínimo local', lx, ly); ly += lh;
  fill(CONFIG.COLORS.HUD_TEXT);
  text('     recoge el diamante: +ENERGÍA', lx, ly); ly += lh + 4;

  fill('#ff9999');
  text('  ✕  donde f(x) < umbral  →  ENEMIGOS', lx, ly); ly += lh;
  fill(CONFIG.COLORS.HUD_TEXT);
  text('     sáltales encima para eliminarlos', lx, ly);

  // ── Right column: Integral ──────────────────────────────────────────────────
  const rx = CONFIG.WIDTH / 2 + 20;
  let ry = 58;

  fill('#4a90d9');
  textSize(13);
  text('── INTEGRAL DE RIEMANN ──', rx, ry); ry += lh + 4;

  fill('#aaccff');
  textSize(11);
  text('Tu energía se acumula como:', rx, ry); ry += lh;

  fill('#00ffcc');
  textSize(13);
  text('  E = ∫v(t)dt', rx, ry); ry += lh + 2;
  textSize(11);
  text('    ≈ Σ v(tᵢ)·Δt', rx, ry); ry += lh + 4;

  fill(CONFIG.COLORS.HUD_TEXT);
  text('Cada frame añade un rectángulo', rx, ry); ry += lh;
  text('de ancho Δt y alto v(t).', rx, ry); ry += lh + 4;

  fill('#aaccff');
  text('Panel (esquina inf-der):', rx, ry); ry += lh;
  fill(CONFIG.COLORS.HUD_TEXT);
  text('  N rectángulos ≈ área bajo la curva', rx, ry); ry += lh;
  text('  teclas [ ] cambian N (5–50)', rx, ry); ry += lh + 4;

  fill('#aa44ff');
  text('Portal al final del nivel:', rx, ry); ry += lh;
  fill(CONFIG.COLORS.HUD_TEXT);
  text('  llégale con E ≥ umbral para abrirlo', rx, ry); ry += lh + 4;

  fill('#aaccff');
  text('Tecla H: mostrar/ocultar panel', rx, ry); ry += lh;
  text('  con f(x), f\'(x) y f\'\'(x) en tiempo real', rx, ry);

  // ── Bottom bar: controls + prompt ──────────────────────────────────────────
  stroke('#333366');
  strokeWeight(1);
  line(40, CONFIG.HEIGHT - 74, CONFIG.WIDTH - 40, CONFIG.HEIGHT - 74);
  noStroke();

  fill('#666688');
  textSize(12);
  textAlign(CENTER, TOP);
  text('Moverse: A / D  o  ← →      Saltar: W / Espacio / ↑      Pausa: ESC', CONFIG.WIDTH / 2, CONFIG.HEIGHT - 66);

  if (Math.floor(frameCount / 30) % 2 === 0) {
    fill('#ffffff');
    textSize(15);
    text('ENTER para comenzar', CONFIG.WIDTH / 2, CONFIG.HEIGHT - 42);
  }
}

// ─── PLAYING ─────────────────────────────────────────────────────────────────

function drawPlaying() {
  if (paused) {
    drawPauseOverlay();
    return;
  }

  const level = LEVELS[currentLevelIndex];

  // Camera follow with lerp
  const targetCamX = Player.get().x - CONFIG.WIDTH / 2.5;
  cameraX = lerp(cameraX, targetCamX, 0.08);
  cameraX = constrain(cameraX, 0, CONFIG.WORLD_WIDTH - CONFIG.WIDTH);

  // Draw terrain
  Terrain.draw(cameraX);

  // Check critical point collection
  checkCriticalCollections();

  // Draw portal
  drawPortal();

  // Update and draw enemies, collect energy bonus
  const eBonus = Enemies.update();
  if (eBonus > 0) energy += eBonus;
  Enemies.draw(cameraX);

  // Update and draw player
  Player.update(level.fn);
  Player.draw(cameraX);

  // Timer
  levelTimer--;
  if (levelTimer <= 0) {
    Player.get().lives = Math.max(0, Player.get().lives - 1);
    if (Player.get().lives <= 0) {
      gameState = 'GAME_OVER';
      return;
    }
    levelTimer = CONFIG.LEVEL_TIME * 60;
  }

  // Riemann history — rolling 240-sample window for visualization
  const spd = Math.abs(Player.get().vx);
  riemannHistory.push({ t: frameCount, v: spd });
  if (riemannHistory.length > 240) riemannHistory.shift();

  // Energy accumulates as running Riemann sum: add this frame's rectangle
  energy += spd * CONFIG.DT;

  // Game over check
  if (Player.get().lives <= 0) {
    gameState = 'GAME_OVER';
    return;
  }

  // Portal activation check
  const px = Player.get().x;
  const portalScreenX = portalX - cameraX;
  const distToPortal = Math.abs(px - portalX);
  if (distToPortal < 30 && energy >= level.energyGoal) {
    levelStats[currentLevelIndex] = {
      energy,
      goal: level.energyGoal,
      history: [...riemannHistory],
    };
    gameState = 'LEVEL_COMPLETE';
    return;
  }

  // HUD
  const critPts = Terrain.getCriticalPoints();
  HUD.draw({
    lives: Player.get().lives,
    levelName: level.name,
    fnStr: level.fnStr,
    energy,
    energyGoal: level.energyGoal,
    levelTimer,
    riemannHistory,
    riemannN,
    showMathPanel,
    currentLevelFn: level.fn,
    playerX: Player.get().x,
    cameraX,
    collectedCriticals,
    totalCriticals: critPts.length,
  });
}

function checkCriticalCollections() {
  const player = Player.get();
  const critPts = Terrain.getCriticalPoints();

  for (let i = 0; i < critPts.length; i++) {
    if (Terrain.isCollected(i)) continue;
    const cp = critPts[i];
    const cpY = Terrain.getY(cp.x);
    const dx = Math.abs(player.x - cp.x);
    const dy = Math.abs(player.y - cpY);

    if (dx < 20 && dy < 28) {
      Terrain.collectPoint(i);
      collectedCriticals++;
      if (cp.type === 'max') {
        Player.superJump();
      } else {
        energy += 20;
      }
    }
  }
}

function drawPortal() {
  const screenX = portalX - cameraX;
  if (screenX < -40 || screenX > CONFIG.WIDTH + 40) return;

  const level = LEVELS[currentLevelIndex];
  const active = energy >= level.energyGoal;
  const pulse = active ? 0.5 + 0.5 * Math.sin(frameCount * 0.1) : 0.3 + 0.1 * Math.sin(frameCount * 0.03);
  const r = 24 + pulse * 12;
  const terrainY = Terrain.getY(portalX);

  push();
  noFill();
  stroke(active ? '#aa44ff' : '#553377');
  strokeWeight(3);
  ellipse(screenX, terrainY - r, r * 2, r * 2.5);

  // Inner glow
  stroke(active ? '#cc88ff' : '#664488');
  strokeWeight(1.5);
  ellipse(screenX, terrainY - r, r * 1.2, r * 1.5);

  // Label
  noStroke();
  fill(active ? '#aa44ff' : '#553377');
  textFont('monospace');
  textSize(10);
  textAlign(CENTER, BOTTOM);
  text(active ? '◉ PORTAL' : 'E < ' + level.energyGoal, screenX, terrainY - r * 2.2 - 4);
  pop();
}

function drawPauseOverlay() {
  fill('rgba(0,0,0,0.6)');
  rect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
  fill('#ffffff');
  textFont('monospace');
  textSize(28);
  textAlign(CENTER, CENTER);
  text('PAUSA', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2);
  textSize(13);
  fill('#aaaaaa');
  text('ESC para continuar', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 40);
}

// ─── LEVEL COMPLETE ───────────────────────────────────────────────────────────

function drawLevelCompleteScreen() {
  // Still draw world behind
  Terrain.draw(cameraX);
  Enemies.draw(cameraX);
  Player.draw(cameraX);

  const critPts = Terrain.getCriticalPoints();
  HUD.drawLevelComplete({
    levelName: LEVELS[currentLevelIndex].name,
    energy,
    energyGoal: LEVELS[currentLevelIndex].energyGoal,
    levelTimer,
    riemannHistory,
    riemannN,
    collectedCriticals,
    totalCriticals: critPts.length,
  });
}

// ─── WIN ──────────────────────────────────────────────────────────────────────

function drawWinScreen() {
  HUD.drawWin(levelStats);
}

// ─── INPUT ────────────────────────────────────────────────────────────────────

function resolveKey() {
  if (keyCode === LEFT_ARROW)  return 'ArrowLeft';
  if (keyCode === RIGHT_ARROW) return 'ArrowRight';
  if (keyCode === UP_ARROW)    return 'ArrowUp';
  if (keyCode === DOWN_ARROW)  return 'ArrowDown';
  if (keyCode === 32)          return 'Space';
  const upper = (key + '').toUpperCase();
  if (upper === 'A') return 'KeyA';
  if (upper === 'D') return 'KeyD';
  if (upper === 'W') return 'KeyW';
  return '';
}

function keyPressed() {
  const mapped = resolveKey();
  if (mapped) Player.handleKey(mapped, true);

  if (keyCode === ENTER) {
    if (gameState === 'MENU') {
      gameState = 'INSTRUCTIONS';
    } else if (gameState === 'INSTRUCTIONS') {
      loadLevel(0);
      gameState = 'PLAYING';
    } else if (gameState === 'LEVEL_COMPLETE') {
      if (currentLevelIndex < LEVELS.length - 1) {
        loadLevel(currentLevelIndex + 1);
        gameState = 'PLAYING';
      } else {
        gameState = 'WIN';
      }
    } else if (gameState === 'GAME_OVER') {
      loadLevel(currentLevelIndex);
      gameState = 'PLAYING';
    } else if (gameState === 'WIN') {
      levelStats = [];
      loadLevel(0);
      gameState = 'MENU';
    }
  }

  if (key === 'h' || key === 'H') showMathPanel = !showMathPanel;
  if (key === ']') riemannN = Math.min(50, riemannN + 1);
  if (key === '[') riemannN = Math.max(5, riemannN - 1);
  if (keyCode === ESCAPE && gameState === 'PLAYING') paused = !paused;

  // Prevent default scroll on arrow keys / space
  if ([32, 37, 38, 39, 40].includes(keyCode)) return false;
}

function keyReleased() {
  const mapped = resolveKey();
  if (mapped) Player.handleKey(mapped, false);
}
