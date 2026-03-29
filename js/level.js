// ============================================================
//  level.js — Generador y gestor del nivel
//  Construye plataformas, tuberías, monedas, enemigos y nubes
// ============================================================

const Level = (() => {

  let platforms = [];
  let pipes     = [];
  let coins     = [];
  let enemies   = [];
  let clouds    = [];
  let particles = [];   // pool de partículas activas
  let goalX     = 0;

  // ── Build ────────────────────────────────────────────────────
  function build() {
    platforms = [];
    pipes     = [];
    coins     = [];
    enemies   = [];
    clouds    = [];
    particles = [];

    const T   = CONFIG.TILE;
    const H   = CONFIG.HEIGHT;
    const LVL = CONFIG.LEVEL;

    // ── Suelo continuo con hoyos ──────────────────────────────
    const pitSet = new Set();
    for (const [start, end] of LVL.PITS) {
      for (let x = start; x <= end; x++) pitSet.add(x);
    }
    for (let x = 0; x < LVL.LENGTH; x++) {
      if (!pitSet.has(x)) {
        platforms.push(new Platform(x * T, H - T, T, T, 'ground'));
      }
    }

    // ── Plataformas flotantes ─────────────────────────────────
    for (const [bx, by, len, type] of LVL.PLATFORMS) {
      for (let i = 0; i < len; i++) {
        platforms.push(new Platform((bx + i) * T, by * T, T, T, type));
      }
    }

    // ── Tuberías ──────────────────────────────────────────────
    for (const tx of LVL.PIPES) {
      pipes.push(new Pipe(tx));
    }

    // ── Monedas ───────────────────────────────────────────────
    for (const [sx, ty, count] of LVL.COINS) {
      for (let i = 0; i < count; i++) {
        coins.push(new Coin(sx + i, ty));
      }
    }

    // ── Enemigos (Goombas) ────────────────────────────────────
    for (const tx of LVL.ENEMIES) {
      enemies.push(new Goomba(tx));
    }

    // ── Nubes de fondo ────────────────────────────────────────
    for (let i = 0; i < 14; i++) clouds.push(new Cloud());

    // ── Meta ──────────────────────────────────────────────────
    goalX = LVL.GOAL_TILE_X * CONFIG.TILE;
  }

  // ── Update ───────────────────────────────────────────────────
  function update(mario) {
    // Enemigos
    for (const e of enemies) e.update(platforms, pipes);

    // Plataformas bounce
    for (const p of platforms) p.applyBounce();

    // Partículas
    particles = Particle.updateAll(particles);

    // Monedas
    for (const c of coins) {
      if (!c.collected && c.overlaps(mario)) {
        c.collected = true;
        STATE.coins++;
        STATE.score += 200;
        spawnParticles(c.x, c.y, CONFIG.COLORS.coin, 6);
      }
    }

    // Colisión Mario ↔ Goombas
    for (const e of enemies) {
      if (!e.alive || e.squished) continue;
      if (!aabb(mario, e)) continue;

      const mBottom = mario.bottom;
      if (mario.vy > 0 && mBottom < e.y + e.h * 0.65) {
        // Mario salta ENCIMA del goomba
        e.squish();
        mario.vy  = -9;
        STATE.score += 100;
        spawnParticles(e.x + e.w / 2, e.y, CONFIG.COLORS.enemy, 8);
      } else if (mario.invFrames === 0) {
        // Mario golpeado
        mario.invFrames = CONFIG.INVINCIBLE_FRAMES;
        return 'mario_hit';
      }
    }

    // ¿Llegó a la meta?
    if (mario.x + mario.w > goalX && mario.x < goalX + 20) {
      STATE.score += 5000;
      return 'win';
    }

    return null;
  }

  // ── Señales del mundo (bloques golpeados desde abajo) ────────
  function handleBlockHit(block) {
    if (!block || block.hit) return;
    if (block.type === 'question') {
      block.hit    = true;
      block.bounce = 8;
      STATE.score += 200;
      STATE.coins++;
      spawnParticles(block.x + CONFIG.TILE / 2, block.y, CONFIG.COLORS.coin, 10);
    } else if (block.type === 'brick') {
      block.bounce = 5;
      spawnParticles(block.x + CONFIG.TILE / 2, block.y, CONFIG.COLORS.brickHL, 6);
    }
  }

  // ── Partículas ───────────────────────────────────────────────
  function spawnParticles(x, y, col, count = 8) {
    const ps = new Particle(x, y, col, count);
    for (const p of ps.particles) particles.push(p);
  }

  // ── Getters ──────────────────────────────────────────────────
  const getPlatforms = () => platforms;
  const getPipes     = () => pipes;
  const getCoins     = () => coins;
  const getEnemies   = () => enemies;
  const getClouds    = () => clouds;
  const getParticles = () => particles;
  const getGoalX     = () => goalX;

  return {
    build,
    update,
    handleBlockHit,
    spawnParticles,
    getPlatforms,
    getPipes,
    getCoins,
    getEnemies,
    getClouds,
    getParticles,
    getGoalX,
  };

})();
