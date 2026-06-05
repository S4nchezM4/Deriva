const Player = (() => {
  let state = {
    x: 80,
    y: 0,
    vx: 0,
    vy: 0,
    onGround: false,
    lives: 3,
    invincible: 0,
    trail: [],
  };

  let keys = {};

  function init() {
    state.x = 80;
    state.y = Terrain.getY(80) - 14;
    state.vx = 0;
    state.vy = 0;
    state.onGround = false;
    state.invincible = 0;
    state.trail = [];
  }

  function resetPosition() {
    state.x = 80;
    state.y = Terrain.getY(80) - 14;
    state.vx = 0;
    state.vy = 0;
    state.onGround = false;
    state.invincible = 90;
  }

  function handleKey(code, pressed) {
    keys[code] = pressed;
  }

  function update(currentLevelFn) {
    // Horizontal movement
    if (keys['ArrowLeft'] || keys['KeyA']) {
      state.vx = -CONFIG.MOVE_SPEED;
    } else if (keys['ArrowRight'] || keys['KeyD']) {
      state.vx = CONFIG.MOVE_SPEED;
    } else {
      state.vx *= 0.85;
    }

    // Slope effect via derivative
    const slope = derivative(currentLevelFn, state.x);
    state.vx -= slope * CONFIG.SLOPE_DAMPING * Math.abs(state.vx + 1);

    // Gravity
    state.vy += CONFIG.GRAVITY;

    // Update position
    state.x += state.vx;
    state.y += state.vy;

    // Clamp world bounds
    state.x = Math.max(0, Math.min(CONFIG.WORLD_WIDTH - 1, state.x));

    // Terrain collision
    const terrainY = Terrain.getY(state.x);
    if (state.y >= terrainY) {
      state.y = terrainY;
      state.vy = 0;
      state.onGround = true;
    } else {
      state.onGround = false;
    }

    // Jump
    if (state.onGround && (keys['ArrowUp'] || keys['KeyW'] || keys['Space'])) {
      state.vy = CONFIG.JUMP_FORCE;
      state.onGround = false;
    }

    // Trail
    state.trail.push({ x: state.x, y: state.y });
    if (state.trail.length > 12) state.trail.shift();

    // Fall off screen
    if (state.y > CONFIG.HEIGHT + 100) {
      state.lives = Math.max(0, state.lives - 1);
      resetPosition();
    }

    // Invincibility countdown
    if (state.invincible > 0) state.invincible--;
  }

  function superJump() {
    state.vy = CONFIG.JUMP_FORCE * 1.6;
    state.onGround = false;
  }

  function takeDamage() {
    if (state.invincible > 0) return false;
    state.lives = Math.max(0, state.lives - 1);
    state.invincible = 90;
    return true;
  }

  function draw(cameraX) {
    push();

    // Trail
    for (let i = 0; i < state.trail.length; i++) {
      const t = state.trail[i];
      const alpha = map(i, 0, state.trail.length - 1, 0, 150);
      const r = map(i, 0, state.trail.length - 1, 4, 10);
      const sx = t.x - cameraX;
      const col = color(CONFIG.COLORS.PLAYER_TRAIL);
      col.setAlpha(alpha);
      noStroke();
      fill(col);
      ellipse(sx, t.y, r, r);
    }

    const sx = state.x - cameraX;

    // Flicker when invincible
    if (state.invincible > 0 && frameCount % 6 < 3) {
      pop();
      return;
    }

    // Player body
    stroke('#00ffcc');
    strokeWeight(2);
    fill(CONFIG.COLORS.PLAYER);
    ellipse(sx, state.y, 28, 28);

    pop();
  }

  function get() { return state; }

  return { init, update, draw, handleKey, get, takeDamage, superJump, resetPosition };
})();
