// ============================================================
//  config.js — Constantes globales y configuración del juego
// ============================================================

const CONFIG = {
  // Canvas
  WIDTH:  900,
  HEIGHT: 500,
  TILE:   32,

  // Física
  GRAVITY:    0.55,
  JUMP_FORCE: -13.5,
  MARIO_SPEED: 4.4,
  ENEMY_SPEED: 1.4,
  MAX_FALL:    18,

  // Juego
  INITIAL_LIVES: 3,
  INVINCIBLE_FRAMES: 90,

  // Paleta de colores SMB3
  COLORS: {
    sky1:          [92,  148, 252],
    sky2:          [40,   90, 200],
    hill:          [0,   156,   0],
    hillDark:      [0,   110,   0],
    ground:        [139,  90,  43],
    groundTop:     [0,   168,   0],
    brick:         [192,  72,  12],
    brickHL:       [220, 110,  30],
    qBlock:        [228, 160,   0],
    qBlockHit:     [130,  80,  30],
    pipe:          [0,   148,   0],
    pipeLight:     [0,   210,   0],
    coin:          [252, 188,  60],
    coinShine:     [255, 235, 130],
    enemy:         [160,  80,  20],
    enemyLight:    [210, 130,  50],
    flagPole:      [190, 190, 190],
    flagGreen:     [0,   210,   0],
    star:          [255, 225,  40],
    // Mario
    hat:           [220,  40,   0],
    skin:          [252, 188,  60],
    shirt:         [52,   52, 220],
    pants:         [200,  60,   0],
    shoe:          [90,   50,  15],
    overalls:      [52,   52, 220],
  },

  // Diseño del nivel (en tiles)
  LEVEL: {
    // Plataformas flotantes [tileX, tileY, largo, tipo]
    // tipo: 'brick' | 'question'
    PLATFORMS: [
      [4,  9, 3,'brick'],   [7,  9, 1,'question'], [8,  9, 2,'brick'],
      [13, 8, 2,'question'], [15, 8, 3,'brick'],
      [20, 7, 4,'brick'],   [22, 7, 1,'question'],
      [28, 9, 3,'brick'],   [30, 7, 1,'question'], [32, 9, 2,'brick'],
      [37, 8, 5,'brick'],   [39, 8, 1,'question'],
      [44, 7, 3,'brick'],
      [48, 9, 4,'brick'],   [49, 9, 1,'question'],
      [57, 8, 3,'brick'],   [59, 8, 1,'question'],
      [63, 7, 6,'brick'],   [65, 7, 1,'question'],
      [70, 9, 3,'brick'],
      [75, 8, 4,'brick'],   [77, 8, 1,'question'],
      [82, 7, 3,'brick'],
      [88, 8, 5,'brick'],   [90, 8, 1,'question'],
      [95, 9, 3,'brick'],
      [100,7, 4,'brick'],   [102,7, 1,'question'],
    ],
    // Tuberías [tileX]
    PIPES: [9, 19, 30, 41, 58, 71, 84, 96],
    // Monedas [tileX inicial, tileY, cantidad]
    COINS: [
      [4,6,6],[12,6,5],[18,5,7],[27,6,4],
      [36,5,6],[45,6,5],[60,5,6],[74,6,5],[89,5,5],[99,6,4]
    ],
    // Goombas [tileX]
    ENEMIES: [8,14,21,29,38,46,59,64,72,78,86,92,98,104],
    // Hoyos en el suelo [tileX inicio, tileX fin]
    PITS: [[50,55],[80,84]],
    GOAL_TILE_X: 110,
    LENGTH: 240,
  },
};

// ─── Estado global del juego ──────────────────────────────────────────────────
const STATE = {
  game:      'loading',   // 'loading' | 'playing' | 'dead' | 'gameover' | 'win'
  score:     0,
  coins:     0,
  lives:     CONFIG.INITIAL_LIVES,
  camera:    0,
  frame:     0,
  deathTimer:0,
  winTimer:  0,

  reset() {
    this.game      = 'playing';
    this.score     = 0;
    this.coins     = 0;
    this.lives     = CONFIG.INITIAL_LIVES;
    this.camera    = 0;
    this.frame     = 0;
    this.deathTimer= 0;
    this.winTimer  = 0;
  },
};
