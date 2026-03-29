// ============================================================
//  entities.js — Clases de entidades del juego
//  Mario · Goomba · Coin · Particle · Platform · Pipe · Cloud
// ============================================================

// ─── Utilidades de colisión AABB ──────────────────────────────
function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

function resolveBlock(entity, block) {
  const ox = Math.min(entity.x + entity.w - block.x, block.x + block.w - entity.x);
  const oy = Math.min(entity.y + entity.h - block.y, block.y + block.h - entity.y);

  if (ox < oy) {
    // Colisión horizontal
    entity.x += entity.x < block.x ? -ox : ox;
    entity.vx = 0;
  } else {
    if (entity.y < block.y) {
      // Aterrizando arriba del bloque
      entity.y -= oy;
      entity.vy  = 0;
      entity.onGround = true;
    } else {
      // Golpe desde abajo
      entity.y += oy;
      entity.vy = 2;
      return 'hit_below';
    }
  }
  return null;
}

// ════════════════════════════════════════════════════════════════
//  CLASS: Mario
// ════════════════════════════════════════════════════════════════
class Mario {
  constructor(tx, ty) {
    this.reset(tx, ty);
  }

  reset(tx = 2, ty = 8) {
    const T = CONFIG.TILE;
    this.x  = tx * T;
    this.y  = ty * T;
    this.vx = 0;
    this.vy = 0;
    this.w  = T * 0.85;
    this.h  = T * 1.32;

    this.onGround    = false;
    this.facing      = 1;          // 1=derecha, -1=izquierda
    this.running     = false;
    this.runAnim     = 0;
    this.dead        = false;
    this.invFrames   = 0;
    this.wasJumping  = false;      // anti-bounce para salto
  }

  update(platforms, pipes) {
    const CFG = CONFIG;

    // ── Input desde Controls ──────────────────────────────────
    const goLeft  = Controls.goLeft();
    const goRight = Controls.goRight();
    const doJump  = Controls.jump() && !this.wasJumping && this.onGround;
    this.wasJumping = Controls.jump();

    if (goLeft)        { this.vx = -CFG.MARIO_SPEED; this.facing = -1; this.running = true; }
    else if (goRight)  { this.vx =  CFG.MARIO_SPEED; this.facing =  1; this.running = true; }
    else               { this.vx *= 0.75; this.running = false; }

    if (doJump) {
      this.vy       = CFG.JUMP_FORCE;
      this.onGround = false;
      return 'jump';    // señal para partículas
    }

    // ── Física ────────────────────────────────────────────────
    this.vy = Math.min(this.vy + CFG.GRAVITY, CFG.MAX_FALL);
    this.x += this.vx;
    this.y += this.vy;
    this.x  = Math.max(0, this.x);

    this.onGround = false;
    const hitSignal = this._resolveAll(platforms, pipes);

    // Animación de carrera
    if (this.running && this.onGround) this.runAnim += 0.18;

    // Invencibilidad
    if (this.invFrames > 0) this.invFrames--;

    // Caída al vacío
    if (this.y > CFG.HEIGHT + 80) return 'pit_death';

    return hitSignal;
  }

  _resolveAll(platforms, pipes) {
    let signal = null;
    for (const p of platforms) {
      if (aabb(this, p)) {
        const r = resolveBlock(this, p);
        if (r === 'hit_below') signal = { type: 'block_hit', block: p };
      }
    }
    for (const p of pipes) {
      if (aabb(this, p)) resolveBlock(this, p);
    }
    return signal;
  }

  die() {
    this.dead  = true;
    this.vy    = -14;
    this.vx    = 0;
  }

  updateDead() {
    this.vy = Math.min(this.vy + CONFIG.GRAVITY, CONFIG.MAX_FALL);
    this.y += this.vy;
  }

  get centerX() { return this.x + this.w / 2; }
  get centerY() { return this.y + this.h / 2; }
  get bottom()  { return this.y + this.h; }
}

// ════════════════════════════════════════════════════════════════
//  CLASS: Goomba
// ════════════════════════════════════════════════════════════════
class Goomba {
  constructor(tx) {
    const T = CONFIG.TILE;
    this.x  = tx * T;
    this.y  = (CONFIG.HEIGHT / T - 3) * T;
    this.vx = -CONFIG.ENEMY_SPEED;
    this.vy = 0;
    this.w  = T;
    this.h  = T;
    this.alive    = true;
    this.squished = false;
    this.squishTimer = 0;
    this.anim     = Math.random() * Math.PI * 2;
  }

  update(platforms, pipes) {
    if (!this.alive) return;

    if (this.squished) {
      this.squishTimer--;
      if (this.squishTimer <= 0) this.alive = false;
      return;
    }

    this.vy = Math.min(this.vy + CONFIG.GRAVITY, CONFIG.MAX_FALL);
    this.x += this.vx;
    this.y += this.vy;
    this.anim += 0.12;

    // Colisión con suelo
    for (const p of platforms) {
      if (p.type === 'ground' && aabb(this, p)) {
        const oy = Math.min(this.y + this.h - p.y, p.y + p.h - this.y);
        const ox = Math.min(this.x + this.w - p.x, p.x + p.w - this.x);
        if (oy < ox) { if (this.y < p.y) { this.y -= oy; this.vy = 0; } }
        else { this.vx *= -1; }
      }
    }
    for (const p of pipes) {
      if (aabb(this, p)) {
        const ox = Math.min(this.x + this.w - p.x, p.x + p.w - this.x);
        this.x += this.x < p.x ? -ox : ox;
        this.vx *= -1;
      }
    }
    if (this.y > CONFIG.HEIGHT + 80) this.alive = false;
  }

  squish() {
    this.squished    = true;
    this.squishTimer = 28;
  }
}

// ════════════════════════════════════════════════════════════════
//  CLASS: Coin
// ════════════════════════════════════════════════════════════════
class Coin {
  constructor(tx, ty) {
    this.x         = tx * CONFIG.TILE + CONFIG.TILE / 2;
    this.y         = ty * CONFIG.TILE;
    this.r         = 9;
    this.collected = false;
    this.phase     = Math.random() * Math.PI * 2;
  }

  overlaps(mario) {
    const dx = mario.centerX - this.x;
    const dy = mario.centerY - this.y;
    return Math.sqrt(dx * dx + dy * dy) < CONFIG.TILE * 0.75;
  }
}

// ════════════════════════════════════════════════════════════════
//  CLASS: Particle
// ════════════════════════════════════════════════════════════════
class Particle {
  constructor(x, y, col, count = 8) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 7,
        vy: Math.random() * -6 - 1,
        col,
        life: 28,
        maxLife: 28,
      });
    }
  }

  // Actualiza y filtra partículas muertas
  static updateAll(list) {
    for (const p of list) {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.35;
      p.life--;
    }
    return list.filter(p => p.life > 0);
  }
}

// ════════════════════════════════════════════════════════════════
//  CLASS: Platform (incluye ground, brick, question)
// ════════════════════════════════════════════════════════════════
class Platform {
  constructor(x, y, w, h, type) {
    this.x    = x;  this.y = y;
    this.w    = w;  this.h = h;
    this.type = type;   // 'ground' | 'brick' | 'question'
    this.hit  = false;
    this.bounce = 0;
  }

  applyBounce() {
    if (this.bounce > 0) this.bounce *= 0.72;
    if (this.bounce < 0.3) this.bounce = 0;
  }
}

// ════════════════════════════════════════════════════════════════
//  CLASS: Pipe
// ════════════════════════════════════════════════════════════════
class Pipe {
  constructor(tx) {
    const T = CONFIG.TILE;
    const H = CONFIG.HEIGHT;
    this.x = tx * T;
    this.y = H - T * 4;
    this.w = T * 2;
    this.h = T * 3;
  }
}

// ════════════════════════════════════════════════════════════════
//  CLASS: Cloud
// ════════════════════════════════════════════════════════════════
class Cloud {
  constructor() {
    this.x     = Math.random() * 7000;
    this.y     = 40 + Math.random() * 130;
    this.speed = 0.15 + Math.random() * 0.25;
    this.w     = 90  + Math.random() * 110;
  }
}
