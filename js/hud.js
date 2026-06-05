const HUD = (() => {

  function draw(state) {
    const {
      lives, levelName, fnStr, energy, energyGoal,
      levelTimer, riemannHistory, riemannN,
      showMathPanel, currentLevelFn, playerX, cameraX,
      collectedCriticals, totalCriticals,
    } = state;

    drawTopBar(lives, levelName, energy, energyGoal, levelTimer);

    if (showMathPanel) {
      drawMathPanel(fnStr, playerX, currentLevelFn, riemannN);
    }

    drawRiemannPanel(riemannHistory, riemannN, energy);
  }

  function drawTopBar(lives, levelName, energy, energyGoal, levelTimer) {
    push();
    fill(CONFIG.COLORS.HUD_BG);
    noStroke();
    rect(0, 0, CONFIG.WIDTH, 36);

    // Lives
    textSize(16);
    textAlign(LEFT, CENTER);
    fill('#ff6666');
    for (let i = 0; i < 3; i++) {
      fill(i < lives ? '#ff6666' : '#444444');
      text('♥', 10 + i * 22, 18);
    }

    // Level name
    fill(CONFIG.COLORS.HUD_TEXT);
    textSize(13);
    textFont('monospace');
    textAlign(CENTER, CENTER);
    text(levelName, CONFIG.WIDTH / 2, 18);

    // Energy bar
    const barX = CONFIG.WIDTH - 200;
    const barW = 120;
    const barH = 12;
    const barY = 12;
    fill('#222244');
    rect(barX, barY, barW, barH, 3);
    const pct = Math.min(energy / energyGoal, 1);
    fill(pct >= 1 ? '#aa44ff' : '#4a90d9');
    rect(barX, barY, barW * pct, barH, 3);
    fill(CONFIG.COLORS.HUD_TEXT);
    textSize(10);
    textAlign(LEFT, CENTER);
    text('E=' + Math.round(energy) + '/' + energyGoal, barX + barW + 5, 18);

    // Timer
    const secs = Math.ceil(levelTimer / 60);
    fill(secs < 10 ? '#ff4444' : CONFIG.COLORS.HUD_TEXT);
    textSize(13);
    textAlign(RIGHT, CENTER);
    text('0:' + String(secs).padStart(2, '0'), CONFIG.WIDTH - 5, 18);

    pop();
  }

  function drawMathPanel(fnStr, playerX, fn, riemannN) {
    const px = CONFIG.WIDTH - 220;
    const py = 46;
    const pw = 215;
    const ph = 130;

    push();
    fill(CONFIG.COLORS.HUD_BG);
    stroke('#4a90d9');
    strokeWeight(1);
    rect(px, py, pw, ph, 4);

    noStroke();
    fill('#4a90d9');
    textSize(10);
    textFont('monospace');
    textAlign(LEFT, TOP);

    const lh = 16;
    let y = py + 8;

    text('── ANÁLISIS f(x) ──', px + 8, y); y += lh;

    // Truncate fnStr if too long
    const shortFn = fnStr.length > 30 ? fnStr.substring(0, 28) + '…' : fnStr;
    fill(CONFIG.COLORS.HUD_TEXT);
    text(shortFn, px + 8, y); y += lh;

    const fx = fn(playerX);
    const d1 = derivative(fn, playerX);
    const d2 = secondDerivative(fn, playerX);

    fill('#aaccff');
    text('x      = ' + playerX.toFixed(1), px + 8, y); y += lh;
    text('f(x)   = ' + fx.toFixed(2), px + 8, y); y += lh;

    const dir = d1 > 0.05 ? '↗ subiendo' : d1 < -0.05 ? '↘ bajando' : '→ plano';
    text("f'(x)  = " + d1.toFixed(3) + '  ' + dir, px + 8, y); y += lh;

    const curv = d2 < -0.05 ? '∩ cima' : d2 > 0.05 ? '∪ valle' : '≈ plano';
    text("f''(x) = " + d2.toFixed(3) + '  ' + curv, px + 8, y); y += lh;

    fill('#888888');
    text('N=' + riemannN + '  ([/] cambiar)', px + 8, y);

    pop();
  }

  function drawRiemannPanel(history, N, energy) {
    const pw = 210;
    const ph = 90;
    const px = CONFIG.WIDTH - pw - 5;
    const py = CONFIG.HEIGHT - ph - 5;

    push();
    fill(CONFIG.COLORS.HUD_BG);
    stroke('#4a90d9');
    strokeWeight(1);
    rect(px, py, pw, ph, 4);

    // Title & energy
    noStroke();
    fill('#4a90d9');
    textSize(10);
    textFont('monospace');
    textAlign(LEFT, TOP);
    text('v(t)', px + 6, py + 6);
    textAlign(RIGHT, TOP);
    text('∫v dt ≈ ' + energy.toFixed(1), px + pw - 6, py + 6);

    if (history.length < 2) { pop(); return; }

    const chartX = px + 6;
    const chartY = py + 20;
    const chartW = pw - 12;
    const chartH = ph - 28;

    // Find max velocity for scaling
    let maxV = 0.1;
    for (const s of history) { if (s.v > maxV) maxV = s.v; }

    // Draw Riemann rectangles
    const step = Math.floor(history.length / N) || 1;
    const rectW = chartW / N;

    fill(CONFIG.COLORS.RIEMANN_FILL);
    stroke(CONFIG.COLORS.RIEMANN_LINE);
    strokeWeight(0.8);

    for (let i = 0; i < N; i++) {
      const idx = Math.min(Math.floor(i * history.length / N), history.length - 1);
      const v = history[idx].v;
      const rh = map(v, 0, maxV, 0, chartH);
      rect(chartX + i * rectW, chartY + chartH - rh, rectW, rh);
    }

    // Velocity curve overlay
    stroke(CONFIG.COLORS.VELOCITY_CRV);
    strokeWeight(1.5);
    noFill();
    beginShape();
    for (let i = 0; i < history.length; i++) {
      const cx = map(i, 0, history.length - 1, chartX, chartX + chartW);
      const cy = map(history[i].v, 0, maxV, chartY + chartH, chartY);
      vertex(cx, cy);
    }
    endShape();

    // Axis
    stroke('#446688');
    strokeWeight(1);
    line(chartX, chartY + chartH, chartX + chartW, chartY + chartH);

    noStroke();
    fill('#446688');
    textSize(8);
    textAlign(RIGHT, BOTTOM);
    text('t', chartX + chartW, chartY + chartH + 2);

    pop();
  }

  function drawLevelComplete(state) {
    const { levelName, energy, energyGoal, levelTimer, riemannHistory, riemannN, collectedCriticals, totalCriticals } = state;

    push();
    fill('rgba(0,0,0,0.85)');
    rect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

    textFont('monospace');
    textAlign(CENTER, CENTER);

    fill('#aa44ff');
    textSize(36);
    text('PORTAL ABIERTO', CONFIG.WIDTH / 2, 100);

    fill(CONFIG.COLORS.HUD_TEXT);
    textSize(16);
    text(levelName, CONFIG.WIDTH / 2, 148);

    textSize(14);
    fill('#4a90d9');
    text('Energía: ' + energy.toFixed(1) + ' / ' + energyGoal, CONFIG.WIDTH / 2, 190);
    text('Tiempo restante: ' + Math.ceil(levelTimer / 60) + 's', CONFIG.WIDTH / 2, 212);
    text('Puntos críticos: ' + collectedCriticals + ' / ' + totalCriticals, CONFIG.WIDTH / 2, 234);

    // Static Riemann visualization
    drawStaticRiemann(riemannHistory, riemannN, 160, 260, 480, 80);

    fill('#aaaaaa');
    textSize(13);
    text('ENTER para continuar', CONFIG.WIDTH / 2, 380);

    pop();
  }

  function drawStaticRiemann(history, N, x, y, w, h) {
    if (history.length < 2) return;
    push();
    fill(CONFIG.COLORS.HUD_BG);
    stroke('#4a90d9');
    strokeWeight(1);
    rect(x, y, w, h, 4);

    let maxV = 0.1;
    for (const s of history) { if (s.v > maxV) maxV = s.v; }

    const chartX = x + 4;
    const chartY = y + 8;
    const chartW = w - 8;
    const chartH = h - 16;
    const rectW = chartW / N;

    fill(CONFIG.COLORS.RIEMANN_FILL);
    stroke(CONFIG.COLORS.RIEMANN_LINE);
    strokeWeight(0.5);
    for (let i = 0; i < N; i++) {
      const idx = Math.min(Math.floor(i * history.length / N), history.length - 1);
      const v = history[idx].v;
      const rh = map(v, 0, maxV, 0, chartH);
      rect(chartX + i * rectW, chartY + chartH - rh, rectW, rh);
    }

    stroke(CONFIG.COLORS.VELOCITY_CRV);
    strokeWeight(1.2);
    noFill();
    beginShape();
    for (let i = 0; i < history.length; i++) {
      const cx = map(i, 0, history.length - 1, chartX, chartX + chartW);
      const cy = map(history[i].v, 0, maxV, chartY + chartH, chartY);
      vertex(cx, cy);
    }
    endShape();
    pop();
  }

  function drawWin(levelStats) {
    push();
    fill('rgba(0,0,0,0.92)');
    rect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

    textFont('monospace');
    textAlign(CENTER, CENTER);

    fill('#ffdd44');
    textSize(38);
    text('¡MISIÓN COMPLETADA!', CONFIG.WIDTH / 2, 80);

    fill('#44ffaa');
    textSize(18);
    text('Dra. Lyra rescatada', CONFIG.WIDTH / 2, 124);

    // Level stats table
    fill(CONFIG.COLORS.HUD_TEXT);
    textSize(13);
    const cols = ['Nivel', 'Energía', 'Objetivo'];
    const colX = [CONFIG.WIDTH / 2 - 160, CONFIG.WIDTH / 2, CONFIG.WIDTH / 2 + 120];

    fill('#4a90d9');
    for (let i = 0; i < cols.length; i++) {
      textAlign(CENTER, TOP);
      text(cols[i], colX[i], 160);
    }

    for (let i = 0; i < levelStats.length; i++) {
      const st = levelStats[i];
      fill(CONFIG.COLORS.HUD_TEXT);
      const row = 180 + i * 20;
      text('Nivel ' + (i + 1), colX[0], row);
      text(st.energy.toFixed(1), colX[1], row);
      text(st.goal, colX[2], row);
    }

    // 3 mini Riemann charts
    const miniW = 200;
    const miniH = 60;
    const gap = 20;
    const totalW = 3 * miniW + 2 * gap;
    const startX = (CONFIG.WIDTH - totalW) / 2;

    for (let i = 0; i < levelStats.length; i++) {
      const mx = startX + i * (miniW + gap);
      const my = 260;
      fill('#4a90d9');
      textSize(10);
      textAlign(CENTER, BOTTOM);
      text('Nivel ' + (i + 1), mx + miniW / 2, my - 2);
      drawStaticRiemann(levelStats[i].history, 15, mx, my, miniW, miniH);
    }

    fill('#aaaaaa');
    textSize(13);
    textAlign(CENTER, CENTER);
    text('ENTER para el menú', CONFIG.WIDTH / 2, 380);
    pop();
  }

  function drawGameOver() {
    push();
    fill('rgba(0,0,0,0.88)');
    rect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
    textFont('monospace');
    textAlign(CENTER, CENTER);
    fill('#ff4444');
    textSize(40);
    text('GAME OVER', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 30);
    fill('#aaaaaa');
    textSize(14);
    text('ENTER para reintentar', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 20);
    pop();
  }

  function drawChallenge(state) {
    if (!state) return;
    push();

    fill('rgba(0,0,0,0.72)');
    noStroke();
    rect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

    const bw = 340;
    const bh = state.feedback ? 160 : 230;
    const bx = CONFIG.WIDTH / 2 - bw / 2;
    const by = CONFIG.HEIGHT / 2 - bh / 2 - 20;

    if (state.feedback) {
      const ok = state.feedback === 'correct';
      stroke(ok ? '#00ff88' : '#ff4444');
      fill(ok ? 'rgba(0,40,20,0.97)' : 'rgba(40,0,0,0.97)');
      strokeWeight(2);
      rect(bx, by, bw, bh, 6);
      noStroke();

      fill(ok ? '#00ff88' : '#ff4444');
      textFont('monospace');
      textSize(22);
      textAlign(CENTER, TOP);
      text(ok ? '¡Correcto!' : 'Incorrecto', CONFIG.WIDTH / 2, by + 18);

      const typeStr = state.cp.type === 'max' ? 'Máximo local' : 'Mínimo local';
      fill(CONFIG.COLORS.HUD_TEXT);
      textSize(12);
      text("f''(x) = " + state.d2.toFixed(3) + '  →  ' + typeStr, CONFIG.WIDTH / 2, by + 58);

      if (ok) {
        fill('#aaffcc');
        textSize(13);
        text(state.cp.type === 'max' ? '+SUPER-SALTO' : '+20 ENERGÍA', CONFIG.WIDTH / 2, by + 88);
      } else {
        fill('#ff9999');
        textSize(11);
        text('La anomalía se corrompió → ¡cuidado!', CONFIG.WIDTH / 2, by + 88);
        fill('#888888');
        textSize(10);
        text('f\'\'(x) < 0 → Máximo  |  f\'\'(x) > 0 → Mínimo', CONFIG.WIDTH / 2, by + 114);
      }
      pop();
      return;
    }

    // Active challenge box
    stroke('#4a90d9');
    fill('rgba(5,10,30,0.97)');
    strokeWeight(2);
    rect(bx, by, bw, bh, 6);
    noStroke();

    textFont('monospace');

    // Title
    fill('#ffdd44');
    textSize(14);
    textAlign(CENTER, TOP);
    text('⚡  ANOMALÍA DETECTADA', CONFIG.WIDTH / 2, by + 14);

    stroke('#333366');
    strokeWeight(1);
    line(bx + 10, by + 34, bx + bw - 10, by + 34);
    noStroke();

    // Math values
    textAlign(LEFT, TOP);
    fill('#aaccff');
    textSize(12);
    text("f'(x)  = " + state.d1.toFixed(4) + '  ≈  0  (punto crítico)', bx + 18, by + 44);

    const d2Hint = state.d2 < 0 ? '  < 0' : '  > 0';
    fill('#00ffcc');
    text("f''(x) = " + state.d2.toFixed(4) + d2Hint, bx + 18, by + 62);

    fill('#666688');
    textSize(10);
    text("Recuerda: f''(x) < 0 → máximo  |  f''(x) > 0 → mínimo", bx + 18, by + 86);

    // Answer options
    textSize(14);
    textAlign(CENTER, TOP);
    fill('#ffdd44');
    text('[M]  Máximo local', CONFIG.WIDTH / 2, by + 110);
    fill('#44ffaa');
    text('[N]  Mínimo local', CONFIG.WIDTH / 2, by + 134);

    // Timer bar
    const pct = state.timeLeft / (CONFIG.CHALLENGE_TIME * 60);
    const barW = bw - 24;
    fill('#222244');
    rect(bx + 12, by + bh - 34, barW, 10, 3);
    fill(pct > 0.4 ? '#4a90d9' : '#ff4444');
    rect(bx + 12, by + bh - 34, barW * pct, 10, 3);
    fill('#888888');
    textSize(9);
    textAlign(CENTER, TOP);
    text('⏱ ' + (state.timeLeft / 60).toFixed(1) + ' s', CONFIG.WIDTH / 2, by + bh - 20);

    pop();
  }

  function drawZoneAlert(alert) {
    if (!alert || alert.timer <= 0) return;
    push();
    const alpha = Math.min(1, alert.timer / 30);

    textFont('monospace');
    textSize(12);
    textAlign(CENTER, CENTER);

    const msg = alert.message;
    const tw = textWidth(msg) + 24;
    const th = 26;
    const tx = CONFIG.WIDTH / 2 - tw / 2;
    const ty = CONFIG.HEIGHT - 108;

    fill(`rgba(0,0,0,${(alpha * 0.75).toFixed(2)})`);
    noStroke();
    rect(tx, ty, tw, th, 4);

    if (alert.isWarning) {
      fill(`rgba(255,140,40,${alpha.toFixed(2)})`);
    } else {
      fill(`rgba(50,220,100,${alpha.toFixed(2)})`);
    }
    text(msg, CONFIG.WIDTH / 2, ty + th / 2);
    pop();
  }

  return { draw, drawLevelComplete, drawWin, drawGameOver, drawChallenge, drawZoneAlert };
})();
