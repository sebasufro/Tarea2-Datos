// ============================================================
//  ui.js — Interfaz de usuario
//  HUD · Pantalla de carga · Game Over · Victoria · Preview cámara
// ============================================================

const UI = (() => {

  const W = CONFIG.WIDTH;
  const H = CONFIG.HEIGHT;

  // Estrellas decorativas para pantallas especiales
  let _bgStars = [];
  for (let i = 0; i < 90; i++) {
    _bgStars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 1 + Math.random() * 2.5,
      phase: Math.random() * Math.PI * 2,
    });
  }

  // ── HUD ──────────────────────────────────────────────────────
  function drawHUD(score, coins, lives) {
    // Barra superior semi-transparente
    noStroke();
    fill(0, 0, 0, 155);
    rect(0, 0, W, 48);

    textFont('monospace');
    noStroke();

    // ── Puntaje ──
    fill(190, 190, 190); textSize(11); textAlign(LEFT);
    text('MARIO', 20, 17);
    fill(255, 220, 0); textSize(19);
    text(nf(score, 7), 20, 39);

    // ── Monedas ──
    noStroke();
    fill(...CONFIG.COLORS.coin);   ellipse(244, 25, 17, 17);
    fill(...CONFIG.COLORS.coinShine); ellipse(244, 23, 8, 10);
    fill(255); textSize(19); textAlign(LEFT);
    text('×' + nf(coins, 2), 258, 39);

    // ── World ──
    fill(190, 190, 190); textSize(11); textAlign(CENTER);
    text('WORLD', W / 2, 17);
    fill(255); textSize(19);
    text('1 - 1', W / 2, 39);

    // ── Vidas ──
    fill(190, 190, 190); textSize(11); textAlign(RIGHT);
    text('VIDAS', W - 20, 17);
    fill(220, 40, 0); textSize(19);
    text('♥ × ' + lives, W - 20, 39);
  }

  // ── Barra de ayuda inferior ───────────────────────────────────
  function drawControlsBar(gestureClass) {
    noStroke();
    fill(0, 0, 0, 130);
    rect(0, H - 28, W, 28);

    textFont('monospace'); textSize(11); textAlign(CENTER); noStroke();
    fill(160, 210, 255);
    text(
      '✋  izquierda ◄  |  ✋  neutral ■  |  ✋  derecha ►  |  ✋  arriba ▲ SALTAR',
      W / 2, H - 10
    );

    // Indicador del gesto actual
    const label = {
      izquierda: '◄ IZQUIERDA',
      derecha:   '► DERECHA',
      arriba:    '▲ SALTAR',
      neutral:   '■ QUIETO',
    }[gestureClass] || '';
    fill(80, 230, 100); textSize(11); textAlign(RIGHT);
    text('🤙 ' + label, W - 150, H - 10);
  }

  // ── Vista previa de cámara + indicador TM ────────────────────
  function drawCameraPreview(videoEl, gestureClass, confidence) {
    const vw = 130, vh = 98;
    const vx = W - vw - 14, vy = 54;
    const ready = Controls.isReady();

    // Marco
    const frameCol = ready ? color(0, 210, 60) : color(200, 200, 80);
    stroke(frameCol); strokeWeight(2.5); noFill();
    rect(vx - 2, vy - 2, vw + 4, vh + 4, 4);
    noStroke();

    // Video
    fill(10, 10, 20);
    rect(vx, vy, vw, vh);
    if (videoEl && videoEl.loadedmetadata) {
      push();
      // Espejo horizontal para preview natural
      translate(vx + vw, vy); scale(-1, 1);
      image(videoEl, 0, 0, vw, vh);
      pop();
    }

    // Etiqueta del gesto con confianza
    if (ready && gestureClass) {
      const colors = {
        izquierda: [80, 180, 255],
        derecha:   [255, 160, 40],
        arriba:    [80, 230, 100],
        neutral:   [180, 180, 180],
      };
      const gc = colors[gestureClass] || [200, 200, 200];

      noStroke();
      fill(...gc, 200);
      rect(vx, vy + vh - 22, vw, 22, 0, 0, 3, 3);
      fill(0); textSize(11); textFont('monospace'); textAlign(CENTER);
      const pct = Math.round((confidence || 0) * 100);
      text(gestureClass.toUpperCase() + ' ' + pct + '%', vx + vw/2, vy + vh - 7);
    }

    // Etiqueta superior
    noStroke(); fill(180, 210, 255, 200); textSize(9); textFont('monospace'); textAlign(LEFT);
    text('📷 Teachable Machine', vx, vy - 6);

    // Indicador de estado del modelo
    if (!ready) {
      fill(255, 200, 0, 200);
      textSize(10); textAlign(CENTER);
      text('Cargando modelo…', vx + vw/2, vy + vh/2 + 5);
    }
  }

  // ── Pantalla de carga ─────────────────────────────────────────
  function drawLoading(frame) {
    background(10, 10, 30);
    _drawBgStars(frame);

    // Título
    fill(247, 201, 72); textFont('monospace'); textSize(50); textAlign(CENTER, CENTER);
    text('🍄 SUPER MARIO', W/2, H/2 - 75);
    fill(230, 100, 40); textSize(20); textAlign(CENTER, CENTER);
    text('TEACHABLE MACHINE EDITION', W/2, H/2 - 25);

    // Instrucciones del modelo
    fill(160, 200, 255); textSize(12); textAlign(CENTER);
    text('Entrena tu modelo en teachablemachine.withgoogle.com', W/2, H/2 + 20);
    fill(200, 200, 200); textSize(11);
    text('Clases requeridas:  arriba  ·  derecha  ·  izquierda  ·  neutral', W/2, H/2 + 44);

    // Barra animada
    const barW = 300;
    const progress = (sin(frame * 0.04) * 0.5 + 0.5);
    fill(40, 40, 60);
    rect(W/2 - barW/2, H/2 + 65, barW, 12, 6);
    fill(247, 201, 72);
    rect(W/2 - barW/2, H/2 + 65, barW * progress, 12, 6);

    fill(180, 180, 180); textSize(11);
    text('Iniciando cámara y modelo…', W/2, H/2 + 96);
  }

  // ── Game Over ─────────────────────────────────────────────────
  function drawGameOver(score, frame) {
    // Overlay oscuro
    fill(0, 0, 0, 175); noStroke(); rect(0, 0, W, H);

    // Panel central
    fill(15, 10, 30, 220); noStroke();
    rect(W/2 - 260, H/2 - 110, 520, 220, 16);
    stroke(200, 40, 40); strokeWeight(3); noFill();
    rect(W/2 - 260, H/2 - 110, 520, 220, 16);
    noStroke();

    fill(220, 40, 0); textFont('monospace'); textSize(64); textAlign(CENTER, CENTER);
    text('GAME OVER', W/2, H/2 - 40);
    fill(255); textSize(24);
    text('Puntaje: ' + nf(score, 7), W/2, H/2 + 18);

    // Parpadeo del mensaje
    if (floor(frame / 28) % 2 === 0) {
      fill(200, 200, 200); textSize(15);
      text('Presiona  ESPACIO  para reiniciar', W/2, H/2 + 62);
    }
  }

  // ── Victoria ──────────────────────────────────────────────────
  function drawWin(score, coins, frame) {
    fill(0, 0, 0, 155); noStroke(); rect(0, 0, W, H);

    // Estrellas giratorias
    for (let i = 0; i < 22; i++) {
      const a = (frame * 0.028 + i * 1.55) % TWO_PI;
      const r = 185 + sin(frame * 0.05 + i) * 28;
      fill(255, 220, 0, 190); noStroke();
      _drawStar(W/2 + cos(a)*r, H/2 + sin(a)*(r*0.42), 4, 10, 5);
    }

    // Panel
    fill(10, 25, 60, 210); noStroke();
    rect(W/2 - 270, H/2 - 115, 540, 230, 18);
    stroke(255, 220, 0); strokeWeight(3); noFill();
    rect(W/2 - 270, H/2 - 115, 540, 230, 18);
    noStroke();

    fill(255, 220, 0); textFont('monospace'); textSize(60); textAlign(CENTER, CENTER);
    text('¡GANASTE!', W/2, H/2 - 45);
    fill(255); textSize(22);
    text('Puntaje Final: ' + nf(score, 7), W/2, H/2 + 10);
    fill(252, 188, 60); textSize(20);
    text('🪙 Monedas: ' + nf(coins, 2), W/2, H/2 + 42);

    if (floor(frame / 28) % 2 === 0) {
      fill(200, 230, 255); textSize(14);
      text('Presiona  ESPACIO  para jugar de nuevo', W/2, H/2 + 82);
    }
  }

  // ── Helpers privados ─────────────────────────────────────────
  function _drawBgStars(frame) {
    for (const s of _bgStars) {
      const a = 80 + sin(frame * 0.05 + s.phase) * 110;
      fill(255, 255, 200, a); noStroke();
      ellipse(s.x, s.y, s.r, s.r);
    }
  }

  function _drawStar(x, y, r1, r2, pts) {
    const angle = TWO_PI / pts;
    const half  = angle / 2;
    beginShape();
    for (let a = -HALF_PI; a < TWO_PI - HALF_PI; a += angle) {
      vertex(x + cos(a) * r2, y + sin(a) * r2);
      vertex(x + cos(a + half) * r1, y + sin(a + half) * r1);
    }
    endShape(CLOSE);
  }

  // ── API pública ───────────────────────────────────────────────
  return {
    drawHUD,
    drawControlsBar,
    drawCameraPreview,
    drawLoading,
    drawGameOver,
    drawWin,
  };

})();
