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
let challengeState = null; // active anomaly classification challenge
let zoneAlert = null;      // { message, timer, isWarning }
let lastInDangerZone = null;

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
  challengeState = null;
  zoneAlert = null;
  lastInDangerZone = null;
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

function drawMenu() {
  menuXOffset += 0.4;

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
  text('Movimiento: A/D ←/→   Salto: W/Espacio/↑   Desafío: [M] Máximo  [N] Mínimo', CONFIG.WIDTH / 2, 310);
  text('Subdivisiones N: [ ]   Panel matemático: H', CONFIG.WIDTH / 2, 330);

  if (Math.floor(frameCount / 30) % 2 === 0) {
    fill('#ffffff');
    textSize(16);
    text('ENTER para comenzar', CONFIG.WIDTH / 2, 395);
  }
}

function drawInstructions() {
  menuXOffset += 0.4;

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

  stroke('#333366');
  strokeWeight(1);
  line(40, 48, CONFIG.WIDTH - 40, 48);
  noStroke();

  const lh = 18;
  textAlign(LEFT, TOP);
  textSize(12);

  const lx = 44;
  let ly = 58;

  fill('#ffdd44');
  textSize(13);
  text('── CLASIFICAR ANOMALÍAS ──', lx, ly); ly += lh + 4;

  fill('#aaccff');
  textSize(11);
  text('Al tocar ★ o ◆ aparece un DESAFÍO:', lx, ly); ly += lh + 2;

  fill(CONFIG.COLORS.HUD_TEXT);
  text('  Lee f\'\'(x) en la pantalla y decide:', lx, ly); ly += lh + 6;

  fill('#ffdd44');
  textSize(12);
  text('  [M]  si  f\'\'(x) < 0  →  Máximo local', lx, ly); ly += lh + 2;
  fill('#44ffaa');
  text('  [N]  si  f\'\'(x) > 0  →  Mínimo local', lx, ly); ly += lh + 8;

  fill('#aaccff');
  textSize(11);
  text('Resultado:', lx, ly); ly += lh;
  fill('#44ff88');
  text('  ¡Correcto!  →  ★ SUPER-SALTO  /  ◆ +ENERGÍA', lx, ly); ly += lh;
  fill('#ff6666');
  text('  Incorrecto  →  la anomalía se corrompe', lx, ly); ly += lh;
  fill(CONFIG.COLORS.HUD_TEXT);
  text('               y se vuelve un enemigo activo', lx, ly); ly += lh + 8;

  fill('#aaccff');
  textSize(11);
  text('Pista: la regla siempre aparece', lx, ly); ly += lh;
  fill('#888888');
  text('  f\'\'(x) < 0 → cima (máx)  |  f\'\'(x) > 0 → valle (mín)', lx, ly); ly += lh + 8;

  fill('#ff9999');
  textSize(11);
  text('Anomalías sueltas: donde f(x) < umbral', lx, ly); ly += lh;
  fill(CONFIG.COLORS.HUD_TEXT);
  text('  son ya enemigos — sáltalos encima', lx, ly);

  const rx = CONFIG.WIDTH / 2 + 20;
  let ry = 58;

  fill('#4a90d9');
  textSize(13);
  text('── FÍSICA Y ENERGÍA ──', rx, ry); ry += lh + 4;

  fill('#aaccff');
  textSize(11);
  text('El terreno es f(x). Su pendiente te afecta:', rx, ry); ry += lh + 4;

  fill('#ffdd44');
  text('  f\'(x) > 0  ↗  cuesta arriba  →  frenas', rx, ry); ry += lh;
  fill('#44ffaa');
  text('  f\'(x) < 0  ↘  cuesta abajo  →  aceleras', rx, ry); ry += lh;
  fill('#aaccff');
  text('  f\'(x) ≈ 0  →  estás en un punto crítico', rx, ry); ry += lh + 8;

  fill('#4a90d9');
  textSize(13);
  text('Energía = Integral de velocidad:', rx, ry); ry += lh + 2;
  fill('#00ffcc');
  textSize(13);
  text('  E = ∫v(t)dt  ≈  Σ v(tᵢ)·Δt', rx, ry); ry += lh + 4;

  fill(CONFIG.COLORS.HUD_TEXT);
  textSize(11);
  text('Panel inferior-derecha: N rectángulos', rx, ry); ry += lh;
  text('bajo la curva v(t). Más N = mejor aprox.', rx, ry); ry += lh;
  fill('#888888');
  text('  teclas [ ] cambian N  (5 – 50)', rx, ry); ry += lh + 8;

  fill('#aa44ff');
  textSize(11);
  text('Portal al final del nivel:', rx, ry); ry += lh;
  fill(CONFIG.COLORS.HUD_TEXT);
  text('  llégale con  E ≥ umbral  para abrirlo', rx, ry); ry += lh;
  fill('#888888');
  text('  la barra superior muestra E=actual/meta', rx, ry);

  stroke('#333366');
  strokeWeight(1);
  line(40, CONFIG.HEIGHT - 74, CONFIG.WIDTH - 40, CONFIG.HEIGHT - 74);
  noStroke();

  fill('#666688');
  textSize(12);
  textAlign(CENTER, TOP);
  text('Moverse: A/D ← →   Saltar: W/Espacio/↑   Desafío: [M] Máximo  [N] Mínimo   Pausa: ESC', CONFIG.WIDTH / 2, CONFIG.HEIGHT - 66);

  if (Math.floor(frameCount / 30) % 2 === 0) {
    fill('#ffffff');
    textSize(15);
    text('ENTER para comenzar', CONFIG.WIDTH / 2, CONFIG.HEIGHT - 42);
  }
}

function drawPlaying() {
  if (paused) {
    drawPauseOverlay();
    return;
  }

  const level = LEVELS[currentLevelIndex];

  const targetCamX = Player.get().x - CONFIG.WIDTH / 2.5;
  cameraX = lerp(cameraX, targetCamX, 0.08);
  cameraX = constrain(cameraX, 0, CONFIG.WORLD_WIDTH - CONFIG.WIDTH);

  Terrain.draw(cameraX, Player.get().x);
  checkCriticalCollections();

  // Draw portal
  drawPortal();

  const eBonus = Enemies.update();
  if (eBonus > 0) energy += eBonus;
  Enemies.draw(cameraX);

  // physics pauses while challenge is open
  if (challengeState) {
    updateChallenge();
  } else {
    Player.update(level.fn);
  }
  Player.draw(cameraX);

  // timer and energy don't tick during a challenge
  if (!challengeState) {
    levelTimer--;
    if (levelTimer <= 0) {
      Player.get().lives = Math.max(0, Player.get().lives - 1);
      if (Player.get().lives <= 0) {
        gameState = 'GAME_OVER';
        return;
      }
      levelTimer = CONFIG.LEVEL_TIME * 60;
    }

    const spd = Math.abs(Player.get().vx);
    riemannHistory.push({ t: frameCount, v: spd });
    if (riemannHistory.length > 240) riemannHistory.shift();
    energy += spd * CONFIG.DT; // E = ∫v(t)dt
  }

  if (Player.get().lives <= 0) {
    gameState = 'GAME_OVER';
    return;
  }

  if (!challengeState) {
    const currentFx = level.fn(Player.get().x);
    const inDanger = currentFx < level.enemyThreshold;
    if (lastInDangerZone !== inDanger) {
      lastInDangerZone = inDanger;
      zoneAlert = {
        message: inDanger
          ? '⚠ f(x) < ' + level.enemyThreshold + '  →  zona de anomalías'
          : '✓ f(x) > 0  →  zona segura',
        timer: 150,
        isWarning: inDanger,
      };
    }
    if (zoneAlert) {
      zoneAlert.timer--;
      if (zoneAlert.timer <= 0) zoneAlert = null;
    }
  }

  const px = Player.get().x;
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

  // Zone alert overlay
  HUD.drawZoneAlert(zoneAlert);

  // Challenge overlay (on top of everything)
  if (challengeState) {
    HUD.drawChallenge(challengeState);
  }
}

function checkCriticalCollections() {
  if (challengeState) return; // Don't trigger new challenge while one is active

  const player = Player.get();
  const critPts = Terrain.getCriticalPoints();

  for (let i = 0; i < critPts.length; i++) {
    if (Terrain.isCollected(i)) continue;
    const cp = critPts[i];
    const cpY = Terrain.getY(cp.x);
    const dx = Math.abs(player.x - cp.x);
    const dy = Math.abs(player.y - cpY);

    if (dx < 20 && dy < 28) {
      Terrain.collectPoint(i); // mark before challenge opens so it can't re-trigger

      const fn = LEVELS[currentLevelIndex].fn;
      challengeState = {
        cpIndex: i,
        cp: { ...cp },
        cpY,
        d1: derivative(fn, cp.x),
        d2: secondDerivative(fn, cp.x),
        timeLeft: CONFIG.CHALLENGE_TIME * 60,
        feedback: null,
        feedbackTimer: 0,
      };
      break;
    }
  }
}

function updateChallenge() {
  if (!challengeState) return;

  if (challengeState.feedback !== null) {
    challengeState.feedbackTimer--;
    if (challengeState.feedbackTimer <= 0) challengeState = null;
    return;
  }

  challengeState.timeLeft--;
  if (challengeState.timeLeft <= 0) challengeState = null;
}

function answerChallenge(answer) {
  if (!challengeState || challengeState.feedback !== null) return;

  const correct = answer === challengeState.cp.type;
  challengeState.feedback = correct ? 'correct' : 'wrong';
  challengeState.feedbackTimer = 100;

  if (correct) {
    collectedCriticals++;
    if (challengeState.cp.type === 'max') {
      Player.superJump();
    } else {
      energy += 20;
    }
  } else {
    Enemies.spawnCorrupted(challengeState.cp.x);
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

  stroke(active ? '#cc88ff' : '#664488');
  strokeWeight(1.5);
  ellipse(screenX, terrainY - r, r * 1.2, r * 1.5);

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

function drawLevelCompleteScreen() {
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

function drawWinScreen() {
  HUD.drawWin(levelStats);
}

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

  if (gameState === 'PLAYING' && challengeState) {
      if (challengeState.feedback !== null) {
          // Solo skipear si el feedback lleva al menos 60 frames (1 segundo)
          if (challengeState.feedbackTimer <= 40) {
              challengeState = null;
          }
      } else {
          if (key === 'm' || key === 'M') answerChallenge('max');
          if (key === 'n' || key === 'N') answerChallenge('min');
      }
  }

  if (key === 'h' || key === 'H') showMathPanel = !showMathPanel;
  if (key === ']') riemannN = Math.min(50, riemannN + 1);
  if (key === '[') riemannN = Math.max(5, riemannN - 1);
  if (keyCode === ESCAPE && gameState === 'PLAYING') paused = !paused;

  if ([32, 37, 38, 39, 40].includes(keyCode)) return false; // prevent scroll
}

function keyReleased() {
  const mapped = resolveKey();
  if (mapped) Player.handleKey(mapped, false);
}
