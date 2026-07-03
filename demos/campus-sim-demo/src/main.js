(function () {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const hud = document.getElementById('hud');
  const toast = document.getElementById('toast');
  const dialog = document.getElementById('dialog');
  const race = document.getElementById('race');

  ctx.imageSmoothingEnabled = false;

  const TILE_SIZE = 64;
  const world = { width: 1920, height: 1280 };
  const keys = new Set();
  const assets = {};
  const assetManifest = {
    'human-1': './assets/sprites/human-1.png',
    'human-2': './assets/sprites/human-2.png',
    'robot-blue': './assets/sprites/robot-blue.png',
    'wizard-purple': './assets/sprites/wizard-purple.png',
    'cat-orange': './assets/sprites/cat-orange.png',
    'knight-silver': './assets/sprites/knight-silver.png',
    grass1: './assets/tilemaps/grass-plain-1.png',
    grass2: './assets/tilemaps/grass-plain-2.png',
    grass3: './assets/tilemaps/grass-plain-3.png',
    flowers1: './assets/tilemaps/grass-flowers-1.png',
    flowers2: './assets/tilemaps/grass-flowers-2.png',
    path: './assets/tilemaps/stone-path-1.png',
    dirt: './assets/tilemaps/dirt-earth-1.png',
    water: './assets/tilemaps/water-1.png',
    mathWall: './assets/tilemaps/math-wall-1.png',
    scienceWall: './assets/tilemaps/science-building-1.png',
    englishWall: './assets/tilemaps/english-building-1.png',
    brickWall: './assets/tilemaps/brick-wall-1.png',
    arcade: './assets/tilemaps/arcade-cabinet.png',
    desk: './assets/tilemaps/desk-computer.png',
  };

  Object.entries(assetManifest).forEach(([key, src]) => {
    const image = new Image();
    image.src = src;
    image.onload = render;
    assets[key] = image;
  });

  const stages = [
    'Talk to Mrs. Numbers',
    'Collect rally parts',
    'Return to Mrs. Numbers',
    'Start Math Race Rally',
    'Score 80% or better',
    'Badge earned',
  ];
  const items = [
    { id: 'number-battery', label: 'Number Battery', x: 560, y: 650 },
    { id: 'fraction-fuel-cell', label: 'Fraction Fuel Cell', x: 850, y: 540 },
    { id: 'turbo-token', label: 'Turbo Token', x: 1110, y: 690 },
  ];
  const npc = {
    id: 'mrs-numbers',
    name: 'Mrs. Numbers',
    x: 940,
    y: 400,
    sprite: 'wizard-purple',
    facing: 'down',
  };
  const arcade = { id: 'math-race-rally', label: 'Math Race Rally', x: 720, y: 375 };
  const player = {
    x: 1260,
    y: 760,
    speed: 190,
    facing: 'down',
    moving: false,
    sprite: 'human-1',
  };
  const students = [
    { name: 'Maya', x: 1260, y: 520, sprite: 'human-2', route: [[1260, 520], [1450, 560], [1420, 750]], facing: 'down' },
    { name: 'Theo', x: 410, y: 850, sprite: 'robot-blue', route: [[410, 850], [610, 900], [660, 760]], facing: 'down' },
    { name: 'Ari', x: 1040, y: 930, sprite: 'cat-orange', route: [[1040, 930], [1210, 880], [1180, 1030]], facing: 'down' },
    { name: 'June', x: 530, y: 420, sprite: 'human-1', route: [[530, 420], [650, 500], [500, 620]], facing: 'down' },
    { name: 'Sol', x: 1510, y: 920, sprite: 'wizard-purple', route: [[1510, 920], [1600, 720], [1390, 720]], facing: 'down' },
    { name: 'Nia', x: 870, y: 1040, sprite: 'knight-silver', route: [[870, 1040], [760, 940], [930, 900]], facing: 'down' },
  ];

  const quest = {
    stage: 0,
    collected: [],
    raceUnlocked: false,
    lastScore: null,
    complete: false,
  };

  const raceState = {
    active: false,
    questionIndex: 0,
    correct: 0,
    current: null,
  };

  let camera = { x: 0, y: 0 };
  let toastTimer = 0;
  let lastTime = performance.now();

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function imageReady(key) {
    return assets[key] && assets[key].complete && assets[key].naturalWidth > 0;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    toastTimer = 2.8;
  }

  function stageText() {
    if (quest.stage === 1) return `Collect rally parts (${quest.collected.length}/${items.length}).`;
    if (quest.stage === 4 && quest.lastScore !== null) return `Last score: ${quest.lastScore}%. Need 80%.`;
    return stages[quest.stage];
  }

  function updateHud() {
    hud.innerHTML = `
      <p class="hud__label">First Quest - Step ${quest.stage + 1} of ${stages.length}</p>
      <h2>${stages[quest.stage]}</h2>
      <p>${stageText()}</p>
      <div class="steps">${stages
        .map((_, index) => `<span class="step ${index <= quest.stage ? 'active' : ''}"></span>`)
        .join('')}</div>
    `;
  }

  function openDialog(title, body) {
    dialog.innerHTML = `<h2>${title}</h2><p>${body}</p><p>Press Space or E to continue.</p>`;
    dialog.classList.add('visible');
  }

  function closeDialog() {
    dialog.classList.remove('visible');
  }

  function talkToMrsNumbers() {
    if (quest.stage === 0) {
      quest.stage = 1;
      openDialog(
        'Mrs. Numbers',
        'I need three rally parts before Math Race Rally can start. Find the Number Battery, Fraction Fuel Cell, and Turbo Token.',
      );
      showToast('Quest accepted: collect three rally parts.');
      return;
    }
    if (quest.stage === 2) {
      quest.stage = 3;
      quest.raceUnlocked = true;
      openDialog(
        'Mrs. Numbers',
        'Excellent work. Math Race Rally is unlocked. Score 80% or better to earn the Math Explorer badge.',
      );
      showToast('Math Race Rally unlocked.');
      return;
    }
    if (quest.complete) {
      openDialog('Mrs. Numbers', 'Your Math Explorer badge is glowing. The campus noticed your win.');
      return;
    }
    openDialog('Mrs. Numbers', 'Keep going. I will be right here when the rally parts are ready.');
  }

  function collectItem(item) {
    if (quest.stage !== 1 || quest.collected.includes(item.id)) return;
    quest.collected.push(item.id);
    showToast(`Collected ${item.label}.`);
    if (quest.collected.length === items.length) {
      quest.stage = 2;
      showToast('All rally parts found. Return to Mrs. Numbers.');
    }
  }

  function makeQuestion() {
    const a = 2 + ((raceState.questionIndex * 3) % 9);
    const b = 1 + ((raceState.questionIndex * 5) % 8);
    const correct = a + b;
    const options = [correct, correct + 1, Math.max(1, correct - 2), correct + 3]
      .sort((left, right) => ((left * 17 + right * 3) % 7) - 3);
    return { prompt: `${a} + ${b}`, correct, options };
  }

  function openRace() {
    if (!quest.raceUnlocked) {
      showToast('Bring the rally parts back to Mrs. Numbers first.');
      return;
    }
    quest.stage = Math.max(quest.stage, 4);
    raceState.active = true;
    raceState.questionIndex = 0;
    raceState.correct = 0;
    raceState.current = makeQuestion();
    renderRace();
  }

  function renderRace() {
    if (!raceState.active) {
      race.classList.remove('visible');
      return;
    }
    const question = raceState.current;
    race.innerHTML = `
      <h2>Math Race Rally</h2>
      <p>Question ${raceState.questionIndex + 1} of 10. Score 80% or better.</p>
      <h3>${question.prompt} = ?</h3>
      <div class="answers">${question.options
        .map((option) => `<button data-answer="${option}">${option}</button>`)
        .join('')}</div>
    `;
    race.classList.add('visible');
    race.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => answerRace(Number(button.dataset.answer)));
    });
  }

  function answerRace(value) {
    if (!raceState.active || !raceState.current) return;
    if (value === raceState.current.correct) raceState.correct += 1;
    raceState.questionIndex += 1;
    if (raceState.questionIndex >= 10) {
      const score = raceState.correct * 10;
      quest.lastScore = score;
      raceState.active = false;
      race.classList.remove('visible');
      if (score >= 80) {
        quest.stage = 5;
        quest.complete = true;
        showToast(`Quest complete. Math Race score: ${score}%.`);
      } else {
        quest.stage = 4;
        showToast(`Score ${score}%. Try Math Race Rally again.`);
      }
      return;
    }
    raceState.current = makeQuestion();
    renderRace();
  }

  function interact() {
    if (dialog.classList.contains('visible')) {
      closeDialog();
      return;
    }
    if (distance(player, npc) < 90) {
      talkToMrsNumbers();
      return;
    }
    for (const item of items) {
      if (!quest.collected.includes(item.id) && distance(player, item) < 76) {
        collectItem(item);
        return;
      }
    }
    if (distance(player, arcade) < 94) {
      openRace();
      return;
    }
    showToast('Move closer to Mrs. Numbers, a rally part, or the arcade.');
  }

  function updateFacing(entity, dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) entity.facing = dx > 0 ? 'right' : 'left';
    else if (dy !== 0) entity.facing = dy > 0 ? 'down' : 'up';
  }

  function update(dt) {
    let dx = 0;
    let dy = 0;
    if (keys.has('arrowleft') || keys.has('a')) dx -= 1;
    if (keys.has('arrowright') || keys.has('d')) dx += 1;
    if (keys.has('arrowup') || keys.has('w')) dy -= 1;
    if (keys.has('arrowdown') || keys.has('s')) dy += 1;
    const len = Math.hypot(dx, dy) || 1;
    player.moving = dx !== 0 || dy !== 0;
    player.x = Math.max(70, Math.min(world.width - 70, player.x + (dx / len) * player.speed * dt));
    player.y = Math.max(70, Math.min(world.height - 70, player.y + (dy / len) * player.speed * dt));
    if (player.moving) updateFacing(player, dx, dy);

    students.forEach((student, index) => {
      const routeIndex = Math.floor((performance.now() / 1800 + index) % student.route.length);
      const target = student.route[routeIndex];
      const stepX = (target[0] - student.x) * Math.min(1, dt * 1.7);
      const stepY = (target[1] - student.y) * Math.min(1, dt * 1.7);
      student.x += stepX;
      student.y += stepY;
      if (Math.abs(stepX) + Math.abs(stepY) > 0.2) updateFacing(student, stepX, stepY);
    });

    camera.x = Math.max(0, Math.min(world.width - canvas.width, player.x - canvas.width / 2));
    camera.y = Math.max(0, Math.min(world.height - canvas.height, player.y - canvas.height / 2));
    if (toastTimer > 0) {
      toastTimer -= dt;
      if (toastTimer <= 0) toast.classList.remove('visible');
    }
  }

  function drawFallbackRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x - camera.x), Math.round(y - camera.y), w, h);
  }

  function drawImage(key, x, y, w = TILE_SIZE, h = TILE_SIZE) {
    if (!imageReady(key)) {
      drawFallbackRect(x, y, w, h, '#20344b');
      return;
    }
    ctx.drawImage(assets[key], Math.round(x - camera.x), Math.round(y - camera.y), w, h);
  }

  function drawTiledRect(key, x, y, w, h) {
    for (let tileX = x; tileX < x + w; tileX += TILE_SIZE) {
      for (let tileY = y; tileY < y + h; tileY += TILE_SIZE) {
        drawImage(key, tileX, tileY, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  function drawWorldTiles() {
    const startCol = Math.floor(camera.x / TILE_SIZE);
    const endCol = Math.ceil((camera.x + canvas.width) / TILE_SIZE);
    const startRow = Math.floor(camera.y / TILE_SIZE);
    const endRow = Math.ceil((camera.y + canvas.height) / TILE_SIZE);

    for (let row = startRow; row <= endRow; row += 1) {
      for (let col = startCol; col <= endCol; col += 1) {
        const worldX = col * TILE_SIZE;
        const worldY = row * TILE_SIZE;
        let key = 'grass1';
        if ((col + row) % 11 === 0) key = 'flowers1';
        else if ((col * row) % 13 === 0) key = 'flowers2';
        else if ((col + row) % 5 === 0) key = 'grass2';
        else if ((col + row) % 7 === 0) key = 'grass3';
        if (col >= 7 && col <= 8) key = 'path';
        if (row >= 8 && row <= 9) key = 'path';
        drawImage(key, worldX, worldY);
      }
    }
  }

  function drawLabel(text, x, y, align = 'left') {
    ctx.save();
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = align;
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(5,8,16,0.82)';
    ctx.fillStyle = '#f8fbff';
    ctx.strokeText(text, Math.round(x - camera.x), Math.round(y - camera.y));
    ctx.fillText(text, Math.round(x - camera.x), Math.round(y - camera.y));
    ctx.restore();
  }

  function drawProp(key, x, y, size, label) {
    if (imageReady(key)) {
      ctx.drawImage(assets[key], Math.round(x - size / 2 - camera.x), Math.round(y - size / 2 - camera.y), size, size);
    } else {
      drawFallbackRect(x - size / 2, y - size / 2, size, size, '#101827');
    }
    drawLabel(label, x, y + size / 2 + 18, 'center');
  }

  function drawQuestItem(item) {
    drawProp('desk', item.x, item.y, 42, item.label);
    ctx.save();
    ctx.fillStyle = '#ffd166';
    ctx.strokeStyle = '#101827';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(Math.round(item.x - camera.x), Math.round(item.y - 30 - camera.y), 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawSprite(entity, label) {
    const image = assets[entity.sprite];
    const x = Math.round(entity.x - camera.x);
    const y = Math.round(entity.y - camera.y);
    const frame = Math.floor(performance.now() / 160) % 4;
    const moving = entity === player ? player.moving : true;
    const row = entity.facing === 'up' ? 0 : entity.facing === 'down' ? 2 : moving ? 1 : 3;
    const col = moving ? frame : 0;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(x - 18, y + 16, 36, 8);

    if (image && image.complete && image.naturalWidth > 0) {
      const flip = entity.facing === 'right';
      ctx.translate(x, y);
      if (flip) ctx.scale(-1, 1);
      ctx.drawImage(image, col * 96, row * 96, 96, 96, -32, -54, 64, 64);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 12, y - 30, 24, 42);
    }
    ctx.restore();

    ctx.save();
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(5,8,16,0.86)';
    ctx.fillStyle = '#f8fbff';
    ctx.strokeText(label, x, y - 58);
    ctx.fillText(label, x, y - 58);
    ctx.restore();
  }

  function drawCampus() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWorldTiles();

    drawTiledRect('mathWall', 360, 250, 920, 64);
    drawTiledRect('brickWall', 360, 314, 64, 496);
    drawTiledRect('brickWall', 1216, 314, 64, 496);
    drawTiledRect('path', 424, 314, 792, 496);

    drawTiledRect('scienceWall', 1330, 530, 430, 64);
    drawTiledRect('path', 1360, 594, 370, 326);

    drawTiledRect('englishWall', 260, 890, 640, 64);
    drawTiledRect('path', 290, 954, 580, 186);

    drawTiledRect('water', 120, 1040, 240, 160);

    drawLabel('MATH HALL', 420, 305);
    drawLabel('NEXUS PLAZA', 1380, 590);
    drawLabel('STUDY COMMONS', 320, 955);

    drawProp('arcade', arcade.x, arcade.y, 66, arcade.label);
    if (!quest.raceUnlocked) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      drawFallbackRect(arcade.x - 33, arcade.y - 33, 66, 66, '#06111dcc');
      ctx.restore();
    }

    items.forEach((item) => {
      if (!quest.collected.includes(item.id)) drawQuestItem(item);
    });

    students.forEach((student) => drawSprite(student, student.name));
    drawSprite(npc, npc.name);
    drawSprite(player, 'You');
  }

  function render() {
    drawCampus();
    updateHud();
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key === ' ' || key === 'e') {
      event.preventDefault();
      interact();
      return;
    }
    if (key === 'f') {
      if (!document.fullscreenElement) canvas.parentElement.requestFullscreen?.();
      else document.exitFullscreen?.();
      return;
    }
    keys.add(key);
  });

  window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
  canvas.addEventListener('click', interact);

  function renderGameToText() {
    return JSON.stringify({
      coordinateSystem: 'origin top-left, x right, y down',
      player: { x: Math.round(player.x), y: Math.round(player.y), sprite: player.sprite },
      quest,
      assets: {
        sprites: students.map((student) => student.sprite).concat([player.sprite, npc.sprite]),
        tilemapsLoaded: Object.keys(assetManifest).filter((key) => imageReady(key)),
      },
      visibleItems: items.filter((item) => !quest.collected.includes(item.id)).map((item) => item.id),
      race: {
        active: raceState.active,
        questionIndex: raceState.questionIndex,
        correct: raceState.correct,
      },
    });
  }

  function advanceTime(ms) {
    const steps = Math.max(1, Math.round(ms / (1000 / 60)));
    for (let index = 0; index < steps; index += 1) update(1 / 60);
    render();
  }

  window.advanceTime = advanceTime;
  window.render_game_to_text = renderGameToText;
  window.demoTest = {
    setPlayerPosition(x, y) {
      player.x = x;
      player.y = y;
      update(0);
      render();
    },
    interact,
    answerRace,
    getState() {
      return JSON.parse(renderGameToText());
    },
  };

  updateHud();
  render();
  requestAnimationFrame(loop);
})();
