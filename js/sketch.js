// ============================================================
//  sketch.js — Sketch principal de P5.js
//  Orquesta: Controls · Level · Renderer · UI · Entities
// ============================================================

let video;
let mario;

// ── P5: preload ───────────────────────────────────────────────
function preload() {
  // ML5 no requiere preload; se inicializa en setup()
}

// ── P5: setup ─────────────────────────────────────────────────
function setup() {
  const cnv = createCanvas(CONFIG.WIDTH, CONFIG.HEIGHT);
  cnv.parent('game-container');

  // Cámara para Teachable Machine
  video = createCapture(VIDEO, () => {
    Controls.init(video);        // inicializar clasificador TM
    _buildAndStart();
  });
  video.size(224, 224);          // tamaño óptimo para Teachable Machine
  video.hide();

  textFont('monospace');
}

function _buildAndStart() {
  Level.build();
  mario = new Mario(2, 8);
  STATE.reset();
}

// ── P5: draw ──────────────────────────────────────────────────
function draw() {
  STATE.frame++;

  // Modo demo / fallback teclado
  Controls.updateDemo();

  switch (STATE.game) {
    case 'loading':   _sceneLoading();  break;
    case 'playing':   _scenePlaying();  break;
    case 'dead':      _sceneDead();     break;
    case 'gameover':  _sceneGameOver(); break;
    case 'win':       _sceneWin();      break;
  }
}

// ── Escena: Loading ───────────────────────────────────────────
function _sceneLoading() {
  UI.drawLoading(STATE.frame);
  // Pasar a playing cuando el modelo (o modo demo) esté listo
  if (Controls.isReady()) {
    STATE.game = 'playing';
  }
}

// ── Escena: Playing ───────────────────────────────────────────
function _scenePlaying() {
  // 1. Update Mario
  const mSignal = mario.update(Level.getPlatforms(), Level.getPipes());

  // Señales de Mario
  if (mSignal === 'jump') {
    Level.spawnParticles(mario.centerX, mario.bottom, CONFIG.COLORS.coinShine, 5);
  }
  if (mSignal === 'pit_death') {
    _killMario();
    return;
  }
  if (mSignal && mSignal.type === 'block_hit') {
    Level.handleBlockHit(mSignal.block);
  }

  // 2. Update level (enemigos, monedas, partículas, meta)
  const lvlSignal = Level.update(mario);
  if (lvlSignal === 'mario_hit') {
    STATE.lives--;
    mario.invFrames = CONFIG.INVINCIBLE_FRAMES;
    if (STATE.lives <= 0) { STATE.game = 'gameover'; return; }
  }
  if (lvlSignal === 'win') {
    STATE.game = 'win';
    STATE.winTimer = 200;
  }

  // 3. Cámara suave
  STATE.camera = lerp(STATE.camera, mario.x - CONFIG.WIDTH / 3.5, 0.1);
  STATE.camera = max(0, STATE.camera);

  // 4. Render
  _renderWorld();

  // 5. HUD y controles
  UI.drawHUD(STATE.score, STATE.coins, STATE.lives);
  UI.drawControlsBar(Controls.getClass());
  UI.drawCameraPreview(video, Controls.getClass(), Controls.getConfidence());
}

// ── Escena: Mario muerto (animación de salto) ─────────────────
function _sceneDead() {
  mario.updateDead();
  Level.update = () => null;   // congelar nivel durante muerte
  _renderWorld();
  UI.drawHUD(STATE.score, STATE.coins, STATE.lives);

  STATE.deathTimer--;
  if (STATE.deathTimer <= 0) {
    if (STATE.lives <= 0) {
      STATE.game = 'gameover';
    } else {
      mario.reset(2, 8);
      STATE.game = 'playing';
    }
  }
}

// ── Escena: Game Over ─────────────────────────────────────────
function _sceneGameOver() {
  _renderWorld();
  UI.drawGameOver(STATE.score, STATE.frame);
}

// ── Escena: Victoria ──────────────────────────────────────────
function _sceneWin() {
  _renderWorld();
  UI.drawWin(STATE.score, STATE.coins, STATE.frame);
  STATE.winTimer--;
}

// ── Render compartido del mundo ───────────────────────────────
function _renderWorld() {
  const cam   = STATE.camera;
  const frame = STATE.frame;

  Renderer.drawSky();
  Renderer.drawClouds(Level.getClouds(), cam, frame);
  Renderer.drawHills(cam);
  Renderer.drawGoal(Level.getGoalX(), cam, frame);
  Renderer.drawPlatforms(Level.getPlatforms(), cam, frame);
  Renderer.drawPipes(Level.getPipes(), cam);
  Renderer.drawCoins(Level.getCoins(), cam, frame);
  Renderer.drawEnemies(Level.getEnemies(), cam);
  Renderer.drawParticles(Level.getParticles(), cam, frame);
  Renderer.drawMario(mario, cam, frame);
}

// ── Matar a Mario ─────────────────────────────────────────────
function _killMario() {
  STATE.lives--;
  mario.die();
  STATE.game      = 'dead';
  STATE.deathTimer = 140;
}

// ── Tecla ESPACIO: reiniciar ──────────────────────────────────
function keyPressed() {
  if (key === ' ') {
    if (STATE.game === 'gameover' || STATE.game === 'win') {
      Level.build();
      mario.reset(2, 8);
      STATE.reset();
    }
  }
}
