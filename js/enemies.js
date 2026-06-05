const Enemies = (() => {
  let enemies = [];

  function build(levelIndex) {
    enemies = [];
    const fn = LEVELS[levelIndex].fn;
    const threshold = LEVELS[levelIndex].enemyThreshold;
    for (let wx = 300; wx < CONFIG.WORLD_WIDTH - 200; wx += 160) {
      if (fn(wx) < threshold) {
        enemies.push({
          wx,
          originX: wx,
          alive: true,
          dir: 1,
          patrolRange: 65,
          corrupted: false,
          spawnTimer: 0,
        });
      }
    }
  }

  function spawnCorrupted(wx) {
    enemies.push({
      wx,
      originX: wx,
      alive: true,
      dir: 1,
      patrolRange: 50,
      corrupted: true,
      spawnTimer: 120, // 2s grace period before it can damage the player
    });
  }

  function update() {
    const player = Player.get();
    let bonus = 0;

    for (const e of enemies) {
      if (!e.alive) continue;

      if (e.spawnTimer > 0) e.spawnTimer--;

      // Patrol movement
      e.wx += e.dir * 1.2;
      if (e.wx > e.originX + e.patrolRange) e.dir = -1;
      if (e.wx < e.originX - e.patrolRange) e.dir = 1;

      if (e.spawnTimer > 0) continue; // Not ready to collide yet

      const ey = Terrain.getY(e.wx);
      const dx = Math.abs(player.x - e.wx);
      const dy = Math.abs(player.y - ey);

      if (dx < 22 && dy < 22) {
        if (player.vy > 0 && player.y < ey) {
          e.alive = false;
          Player.superJump();
          bonus += 15;
        } else {
          Player.takeDamage();
        }
      }
    }
    return bonus;
  }

  function draw(cameraX) {
    push();
    for (const e of enemies) {
      if (!e.alive) continue;
      const sx = e.wx - cameraX;
      if (sx < -30 || sx > CONFIG.WIDTH + 30) continue;

      const ey = Terrain.getY(e.wx);

      if (e.corrupted) {
        // Pulsing orange for corrupted anomalies
        const pulse = 0.5 + 0.5 * Math.sin(frameCount * 0.18);
        fill(lerpColor(color(CONFIG.COLORS.ENEMY_CORRUPTED), color('#ffff00'), pulse * 0.4));
        stroke('#aa4400');
      } else {
        fill(CONFIG.COLORS.ENEMY);
        stroke('#aa0000');
      }
      strokeWeight(1.5);
      ellipse(sx, ey - 13, 26, 26);

      noStroke();
      fill(e.corrupted ? '#ffcc88' : '#ff9999');
      textAlign(CENTER, BOTTOM);
      textSize(9);
      textFont('monospace');
      text(e.corrupted ? '¡CORRUPTA!' : 'f(x)<0', sx, ey - 28);
    }
    pop();
  }

  function getAll() { return enemies; }

  return { build, update, draw, getAll, spawnCorrupted };
})();
