const Terrain = (() => {
  let currentLevel = null;
  let criticalPoints = [];
  let collectedPoints = new Set();

  function build(levelIndex) {
    currentLevel = LEVELS[levelIndex];
    collectedPoints = new Set();
    criticalPoints = findCriticalPoints(currentLevel.fn, 0, CONFIG.WORLD_WIDTH);
  }

  function getY(worldX) {
    const baseline = CONFIG.HEIGHT * CONFIG.BASELINE;
    return baseline - currentLevel.fn(worldX);
  }

  function draw(cameraX) {
    push();

    // Terrain fill
    fill(CONFIG.COLORS.TERRAIN_FILL);
    stroke(CONFIG.COLORS.TERRAIN_LINE);
    strokeWeight(2);
    beginShape();
    for (let sx = 0; sx <= CONFIG.WIDTH; sx += 2) {
      const wx = sx + cameraX;
      vertex(sx, getY(wx));
    }
    vertex(CONFIG.WIDTH, CONFIG.HEIGHT);
    vertex(0, CONFIG.HEIGHT);
    endShape(CLOSE);

    // Critical point markers
    for (let i = 0; i < criticalPoints.length; i++) {
      const cp = criticalPoints[i];
      if (collectedPoints.has(i)) continue;
      const sx = cp.x - cameraX;
      if (sx < -30 || sx > CONFIG.WIDTH + 30) continue;
      const sy = getY(cp.x);

      if (cp.type === 'max') {
        drawStar(sx, sy - 18, CONFIG.COLORS.CRITICAL_MAX);
      } else {
        drawDiamond(sx, sy - 14, CONFIG.COLORS.CRITICAL_MIN);
      }
    }

    pop();
  }

  function drawStar(x, y, col) {
    push();
    translate(x, y);
    fill(col);
    stroke(col);
    strokeWeight(1);
    beginShape();
    for (let i = 0; i < 10; i++) {
      const angle = (TWO_PI / 10) * i - HALF_PI;
      const r = i % 2 === 0 ? 10 : 4;
      vertex(cos(angle) * r, sin(angle) * r);
    }
    endShape(CLOSE);
    pop();
  }

  function drawDiamond(x, y, col) {
    push();
    translate(x, y);
    fill(col);
    stroke(col);
    strokeWeight(1);
    beginShape();
    vertex(0, -10);
    vertex(7, 0);
    vertex(0, 10);
    vertex(-7, 0);
    endShape(CLOSE);
    pop();
  }

  function collectPoint(index) {
    collectedPoints.add(index);
  }

  function getCriticalPoints() {
    return criticalPoints;
  }

  function isCollected(index) {
    return collectedPoints.has(index);
  }

  return { build, getY, draw, collectPoint, getCriticalPoints, isCollected };
})();
