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
          vy: 0,
          alive: true,
          dir: 1,
          patrolRange: 65,
        });
      }
    }
  }

  function update() {
    const player = Player.get();
    let bonus = 0;

    for (const e of enemies) {
      if (!e.alive) continue;

      // Patrol movement
      e.wx += e.dir * 1.2;
      if (e.wx > e.originX + e.patrolRange) e.dir = -1;
      if (e.wx < e.originX - e.patrolRange) e.dir = 1;

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

      fill(CONFIG.COLORS.ENEMY);
      stroke('#aa0000');
      strokeWeight(1.5);
      ellipse(sx, ey - 13, 26, 26);

      // Label
      noStroke();
      fill('#ff9999');
      textAlign(CENTER, BOTTOM);
      textSize(9);
      textFont('monospace');
      text('f(x)<0', sx, ey - 28);
    }
    pop();
  }

  function getAll() { return enemies; }

  return { build, update, draw, getAll };
})();
