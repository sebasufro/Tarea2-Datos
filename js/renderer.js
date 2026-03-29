// ============================================================
//  renderer.js — Módulo de dibujo (P5.js)
//  Responsable exclusivo de TODOS los gráficos del juego
// ============================================================

const Renderer = (() => {

  const C = CONFIG.COLORS;
  const T = CONFIG.TILE;
  const W = CONFIG.WIDTH;
  const H = CONFIG.HEIGHT;

  // ── Background ───────────────────────────────────────────────
  function drawSky() {
    for (let y = 0; y < H; y++) {
      const t = y / H;
      stroke(
        lerp(C.sky1[0], C.sky2[0], t),
        lerp(C.sky1[1], C.sky2[1], t),
        lerp(C.sky1[2], C.sky2[2], t)
      );
      strokeWeight(1);
      line(0, y, W, y);
    }
    noStroke();
  }

  function drawClouds(clouds, cam, frame) {
    noStroke();
    for (const cl of clouds) {
      const cx = ((cl.x - cam * cl.speed) % (Level.getGoalX() + W + 400));
      if (cx < -cl.w * 2 || cx > W + cl.w) continue;
      _drawCloud(cx, cl.y, cl.w);
    }
  }

  function _drawCloud(x, y, w) {
    fill(255, 255, 255, 220);
    noStroke();
    ellipse(x, y, w, w * 0.5);
    ellipse(x - w * 0.28, y + w * 0.07, w * 0.6, w * 0.38);
    ellipse(x + w * 0.28, y + w * 0.07, w * 0.6, w * 0.38);
    fill(200, 220, 255, 70);
    ellipse(x, y + w * 0.14, w * 0.88, w * 0.24);
  }

  function drawHills(cam) {
    fill(...C.hillDark);
    for (let i = 0; i < 22; i++) {
      const hx = (i * 540 - cam * 0.38 + 180) % (Level.getGoalX() + W + 600) - 100;
      ellipse(hx, H - T * 1.5, 290, 145);
    }
    fill(...C.hill);
    for (let i = 0; i < 22; i++) {
      const hx = (i * 540 - cam * 0.38) % (Level.getGoalX() + W + 600) - 100;
      ellipse(hx, H - T * 1.5, 270, 125);
    }
  }

  // ── Goal flag ────────────────────────────────────────────────
  function drawGoal(goalX, cam, frame) {
    const gx = goalX - cam;
    if (gx < -60 || gx > W + 60) return;

    stroke(...C.flagPole); strokeWeight(5);
    line(gx + 10, H - T * 2, gx + 10, H - T * 10.5);
    noStroke();

    fill(...C.flagGreen);
    const fw = sin(frame * 0.1) * 6;
    triangle(gx + 10, H - T * 10.5, gx + 52 + fw, H - T * 9.5, gx + 10, H - T * 8.5);

    fill(...C.star);
    _drawStar(gx + 10, H - T * 11, 6, 13, 5);
    strokeWeight(1);
  }

  // ── Platforms ────────────────────────────────────────────────
  function drawPlatforms(platforms, cam, frame) {
    noStroke();
    for (const p of platforms) {
      const px = p.x - cam;
      if (px < -T * 2 || px > W + T * 2) continue;
      const py = p.y - p.bounce;
      _drawTile(px, py, p.type, p.hit, frame);
    }
  }

  function _drawTile(x, y, type, hit, frame) {
    noStroke();
    if (type === 'ground') {
      fill(...C.ground);
      rect(x, y, T, T);
      fill(160, 100, 50, 80);
      for (let i = 0; i < 3; i++) ellipse(x + 6 + i * 10, y + 10, 5, 4);

    } else if (type === 'brick') {
      fill(...C.brick);
      rect(x, y, T, T, 1);
      stroke(...C.brickHL, 130); strokeWeight(1);
      line(x, y + T/2, x + T, y + T/2);
      line(x + T/2, y, x + T/2, y + T/2);
      line(x + T/4, y + T/2, x + T/4, y + T);
      line(x + 3*T/4, y + T/2, x + 3*T/4, y + T);
      noStroke();
      fill(...C.brickHL, 90);
      rect(x + 1, y + 1, 12, 12);

    } else if (type === 'question') {
      if (hit) {
        fill(...C.qBlockHit); rect(x, y, T, T, 2);
      } else {
        const pulse = sin(frame * 0.12) * 1.5;
        fill(228 + pulse*2, 160 + pulse, 0);
        rect(x, y - pulse*0.5, T, T, 2);
        fill(255, 220, 50, 210);
        noStroke(); textFont('monospace'); textSize(19); textAlign(CENTER, CENTER);
        text('?', x + T/2, y + T/2 - pulse*0.5);
        fill(255, 245, 110, 110);
        noStroke(); rect(x + 1, y - pulse*0.5 + 1, T - 2, 4, 1);
      }
      noStroke();
    }
  }

  // ── Pipes ────────────────────────────────────────────────────
  function drawPipes(pipes, cam) {
    noStroke();
    for (const p of pipes) {
      const px = p.x - cam;
      if (px < -T * 4 || px > W + T * 4) continue;
      _drawPipe(px, p.y, p.w, p.h);
    }
  }

  function _drawPipe(x, y, w, h) {
    noStroke();
    fill(...C.pipe);
    rect(x + 4, y + T, w - 8, h + 20);
    fill(0, 180, 0);
    rect(x - 4, y, w + 8, T + 4, 3, 3, 0, 0);
    fill(...C.pipeLight);
    rect(x + 8, y + T + 4, 9, h + 10);
    rect(x - 1, y + 3, 8, T - 2);
    stroke(0, 100, 0); strokeWeight(1.5); noFill();
    rect(x - 4, y, w + 8, T + 4, 3, 3, 0, 0);
    noStroke();
  }

  // ── Coins ────────────────────────────────────────────────────
  function drawCoins(coins, cam, frame) {
    noStroke();
    for (const c of coins) {
      if (c.collected) continue;
      const cx = c.x - cam;
      if (cx < -20 || cx > W + 20) continue;
      const bob  = sin(c.phase + frame * 0.04) * 4;
      const spinW = abs(sin(frame * 0.12 + c.phase)) * 14 + 3;
      fill(...C.coin, 70); ellipse(cx, c.y + bob, 28, 28);
      fill(...C.coin);     ellipse(cx, c.y + bob, spinW, 18);
      fill(...C.coinShine);ellipse(cx, c.y + bob, spinW * 0.45, 13);
    }
  }

  // ── Enemies ──────────────────────────────────────────────────
  function drawEnemies(enemies, cam) {
    for (const e of enemies) {
      if (!e.alive) continue;
      const ex = e.x - cam;
      if (ex < -T * 2 || ex > W + T * 2) continue;
      _drawGoomba(ex, e.y, e.w, e.h, e.squished, e.anim);
    }
  }

  function _drawGoomba(x, y, w, h, squished, anim) {
    if (squished) {
      noStroke(); fill(...C.enemy);
      ellipse(x + w/2, y + h - 5, w * 1.3, 14);
      fill(50, 20, 0);
      ellipse(x + w/2 - 6, y + h - 8, 5, 5);
      ellipse(x + w/2 + 6, y + h - 8, 5, 5);
      return;
    }
    const walk = sin(anim) * 4;
    push(); translate(x + w/2, y); noStroke();
    // Sombra
    fill(0, 0, 0, 40); ellipse(0, h - 1, w * 1.1, 8);
    // Cuerpo
    fill(...C.enemy); ellipse(0, h * 0.65, w * 1.1, h * 0.82);
    // Cabeza
    fill(...C.enemyLight); ellipse(0, h * 0.22, w * 0.94, h * 0.55);
    // Cejas enojadas
    stroke(80, 20, 0); strokeWeight(2.5);
    line(-w*0.35, h*0.05, -w*0.1, h*0.12);
    line( w*0.35, h*0.05,  w*0.1, h*0.12);
    noStroke();
    // Ojos
    fill(255); ellipse(-w*0.22, h*0.18, 11, 11); ellipse(w*0.22, h*0.18, 11, 11);
    fill(0);   ellipse(-w*0.2,  h*0.20,  6,  6); ellipse(w*0.24, h*0.20,  6,  6);
    fill(255); ellipse(-w*0.18, h*0.17, 2.5, 2.5); ellipse(w*0.26, h*0.17, 2.5, 2.5);
    // Dientes
    fill(255, 240, 230); noStroke();
    rect(-w*0.26, h*0.35, 7, 6, 1, 1, 2, 2);
    rect(-w*0.08, h*0.35, 7, 6, 1, 1, 2, 2);
    // Pies
    fill(100, 40, 0);
    ellipse(-w*0.24 + walk, h - 5, 14, 9);
    ellipse( w*0.24 - walk, h - 5, 14, 9);
    pop();
  }

  // ── Mario ────────────────────────────────────────────────────
  function drawMario(mario, cam, frame) {
    if (mario.dead) {
      _drawMarioDead(mario, cam); return;
    }
    const blink = mario.invFrames > 0 && floor(frame / 4) % 2 === 0;
    if (blink) return;
    _drawMarioAlive(mario, cam);
  }

  function _drawMarioAlive(mario, cam) {
    const x = mario.x - cam;
    const y = mario.y;
    push(); translate(x + mario.w / 2, y);
    if (mario.facing === -1) scale(-1, 1);
    noStroke();

    const legA = mario.running ? sin(mario.runAnim) * 0.35 : 0;

    // Sombra
    fill(0, 0, 0, 35); ellipse(0, mario.h, mario.w * 1.1, 8);

    // Sombrero
    fill(...C.hat); rect(-11, -14, 22, 9, 2); rect(-7, -22, 16, 10, 3, 3, 0, 0);
    fill(200, 30, 0); rect(-11, -7, 22, 3);

    // Cara
    fill(...C.skin); ellipse(0, 0, 24, 22);
    fill(0); ellipse(5, -2, 6, 6);
    fill(255); ellipse(6.5, -3, 2, 2);
    fill(220, 140, 60); ellipse(4, 3, 7, 5);
    fill(80, 40, 0); arc(-2, 6, 16, 8, 0, PI);

    // Cuerpo
    fill(...C.shirt); rect(-12, 8, 24, 16, 2);
    fill(...C.overalls); rect(-5, 8, 4, 6); rect(1, 8, 4, 6);
    fill(255, 220, 0); ellipse(-5, 16, 4, 4); ellipse(5, 16, 4, 4);

    // Pierna izquierda
    push(); rotate(legA);
    fill(...C.pants); rect(-12, 24, 10, 13, 2);
    fill(...C.shoe);  rect(-14, 35, 13, 7, 2);
    pop();
    // Pierna derecha
    push(); rotate(-legA);
    fill(...C.pants); rect(2, 24, 10, 13, 2);
    fill(...C.shoe);  rect(1, 35, 13, 7, 2);
    pop();
    pop();
  }

  function _drawMarioDead(mario, cam) {
    const x = mario.x - cam;
    const y = mario.y;
    push(); translate(x + mario.w / 2, y); noStroke();
    fill(...C.hat);  rect(-12, -6, 24, 10, 3);
    fill(...C.skin); ellipse(0, 6, 24, 20);
    fill(...C.pants); rect(-12, 14, 24, 10, 2);
    pop();
  }

  // ── Particles ────────────────────────────────────────────────
  function drawParticles(particles, cam, frame) {
    noStroke();
    for (const p of particles) {
      const a = map(p.life, 0, p.maxLife, 0, 220);
      const s = map(p.life, 0, p.maxLife, 2, 11);
      fill(p.col[0], p.col[1], p.col[2], a);
      ellipse(p.x - cam, p.y, s, s);
    }
  }

  // ── Helpers ──────────────────────────────────────────────────
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
    drawSky,
    drawClouds,
    drawHills,
    drawGoal,
    drawPlatforms,
    drawPipes,
    drawCoins,
    drawEnemies,
    drawMario,
    drawParticles,
  };

})();
