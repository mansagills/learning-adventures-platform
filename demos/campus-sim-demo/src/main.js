(function () {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const hud = document.getElementById('hud');
  const toast = document.getElementById('toast');
  const dialog = document.getElementById('dialog');
  const race = document.getElementById('race');
  const storePanel = document.getElementById('store');

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
    modernSchool: './assets/modern/school-32.png',
    modernOffice: './assets/modern/office-32.png',
    modernTerrain: './assets/modern/terrain-32.png',
    modernCity: './assets/modern/city-terrain-32.png',
    modernRoom: './assets/modern/room-builder-32.png',
    modernAdam: './assets/modern/characters/adam-16.png',
    modernAlex: './assets/modern/characters/alex-16.png',
    modernAmelia: './assets/modern/characters/amelia-16.png',
    modernBob: './assets/modern/characters/bob-16.png',
  };

  const modernTiles = {
    grass1: { key: 'modernTerrain', sx: 128, sy: 256 },
    grass2: { key: 'modernTerrain', sx: 128, sy: 384 },
    grass3: { key: 'modernTerrain', sx: 128, sy: 448 },
    flowers1: { key: 'modernTerrain', sx: 960, sy: 64 },
    flowers2: { key: 'modernTerrain', sx: 896, sy: 64 },
    path: { key: 'modernCity', sx: 256, sy: 0 },
    plaza: { key: 'modernCity', sx: 0, sy: 256 },
    dirt: { key: 'modernTerrain', sx: 896, sy: 320 },
    water: { key: 'modernTerrain', sx: 768, sy: 192 },
    interiorFloor: { key: 'modernRoom', sx: 1024, sy: 640 },
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
    sprite: 'modernAmelia',
    facing: 'down',
  };
  const arcade = { id: 'math-race-rally', label: 'Math Race Rally', x: 720, y: 375 };
  const store = { id: 'campus-store', label: 'Campus Store', x: 1510, y: 710 };
  const storeItems = [
    { id: 'neon-backpack', name: 'Neon Backpack', cost: 100, description: 'Adds a bright quest-runner glow to your avatar.' },
    { id: 'focus-headphones', name: 'Focus Headphones', cost: 75, description: 'A study-ready cosmetic for the next campus run.' },
    { id: 'rally-stickers', name: 'Rally Sticker Pack', cost: 25, description: 'A quick reward to show the XP store economy.' },
  ];
  const player = {
    x: 1260,
    y: 760,
    speed: 190,
    facing: 'down',
    moving: false,
    sprite: 'human-1',
  };
  const students = [
    { name: 'Maya', x: 1260, y: 520, sprite: 'modernAlex', route: [[1260, 520], [1450, 560], [1420, 750]], facing: 'down', lines: ['Meet Mrs. Numbers first.', 'Rally parts are scattered.', 'Math Race is tough.'] },
    { name: 'Theo', x: 410, y: 850, sprite: 'modernBob', route: [[410, 850], [610, 900], [660, 760]], facing: 'down', lines: ['I saw a part near Math Hall.', 'Use E when you are close.', 'Campus routes are open.'] },
    { name: 'Ari', x: 1040, y: 930, sprite: 'modernAdam', route: [[1040, 930], [1210, 880], [1180, 1030]], facing: 'down', lines: ['Race practice starts soon.', 'Score 80% for the badge.', 'You have got this.'] },
    { name: 'June', x: 530, y: 420, sprite: 'modernAmelia', route: [[530, 420], [650, 500], [500, 620]], facing: 'down', lines: ['Mrs. Numbers is in Math Hall.', 'Look for the yellow pings.', 'Bring all three parts back.'] },
    { name: 'Sol', x: 1510, y: 920, sprite: 'modernAlex', route: [[1510, 920], [1600, 720], [1390, 720]], facing: 'down', lines: ['The plaza feels busy today.', 'Study group after the rally.', 'Watch the objective marker.'] },
    { name: 'Nia', x: 870, y: 1040, sprite: 'modernBob', route: [[870, 1040], [760, 940], [930, 900]], facing: 'down', lines: ['Badge run in progress.', 'Collect, return, race.', 'Nice pace.'] },
  ];

  const quest = {
    stage: 0,
    collected: [],
    raceUnlocked: false,
    lastScore: null,
    complete: false,
  };
  const progression = {
    xp: 0,
    totalXp: 0,
    xpAwarded: false,
    purchases: [],
    equipped: null,
  };

  const raceState = {
    active: false,
    questionIndex: 0,
    correct: 0,
    current: null,
  };

  let camera = { x: 0, y: 0 };
  let toastTimer = 0;
  let campusCheer = '';
  let campusCheerTimer = 0;
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
    if (quest.complete) return `Quest complete. XP balance: ${progression.xp}.`;
    return stages[quest.stage];
  }

  function objectiveTarget() {
    if (quest.complete && progression.xp > 0 && progression.purchases.length === 0) return store;
    if (quest.stage === 0 || quest.stage === 2 || quest.complete) return npc;
    if (quest.stage === 1) {
      return items.find((item) => !quest.collected.includes(item.id)) || npc;
    }
    if (quest.stage === 3 || quest.stage === 4) return arcade;
    return npc;
  }

  function objectiveHint() {
    if (quest.stage === 0) return 'Head to the yellow marker over Mrs. Numbers, then press E.';
    if (quest.stage === 1) return `Follow the marker to rally parts. ${quest.collected.length}/${items.length} collected.`;
    if (quest.stage === 2) return 'Return to Mrs. Numbers to unlock the rally arcade.';
    if (quest.stage === 3) return 'Walk to Math Race Rally and press E to start.';
    if (quest.stage === 4) return 'Answer 8 of 10 questions correctly to finish the quest.';
    if (progression.xp > 0 && progression.purchases.length === 0) return 'Spend your 100 XP at the Campus Store.';
    if (progression.purchases.length > 0) return `${storeItems.find((item) => item.id === progression.equipped)?.name || 'Reward'} purchased. Demo loop complete.`;
    return 'Badge earned. Talk to Mrs. Numbers for the celebration beat.';
  }

  function updateHud() {
    hud.innerHTML = `
      <p class="hud__label">First Quest - Step ${quest.stage + 1} of ${stages.length}</p>
      <h2>${stages[quest.stage]}</h2>
      <p>${stageText()}</p>
      <p class="hud__label">XP ${progression.xp}</p>
      <p class="hud__hint">${objectiveHint()}</p>
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

  function closeStore() {
    storePanel.classList.remove('visible');
  }

  function awardQuestXp() {
    if (progression.xpAwarded) return;
    progression.xpAwarded = true;
    progression.xp += 100;
    progression.totalXp += 100;
  }

  function talkToMrsNumbers() {
    if (quest.stage === 0) {
      quest.stage = 1;
      openDialog(
        'Mrs. Numbers',
        'I need three rally parts before Math Race Rally can start. Find the Number Battery, Fraction Fuel Cell, and Turbo Token.',
      );
      showToast('Quest accepted: collect three rally parts.');
      campusCheer = 'New quest! Help them find the parts.';
      campusCheerTimer = 5;
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
      campusCheer = 'Rally unlocked! Head to the arcade.';
      campusCheerTimer = 5;
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
    campusCheer = `${item.label} secured!`;
    campusCheerTimer = 4;
    if (quest.collected.length === items.length) {
      quest.stage = 2;
      showToast('All rally parts found. Return to Mrs. Numbers.');
      campusCheer = 'All parts collected. Back to Mrs. Numbers!';
      campusCheerTimer = 5;
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
        awardQuestXp();
        showToast(`Quest complete. Math Race score: ${score}%.`);
        campusCheer = 'Badge earned! Great rally run!';
        campusCheerTimer = 7;
        openDialog('Math Explorer Badge', `Score ${score}%. Quest complete. You earned 100 XP. Visit the Campus Store to spend it.`);
      } else {
        quest.stage = 4;
        showToast(`Score ${score}%. Try Math Race Rally again.`);
        campusCheer = 'Close one. Try the rally again.';
        campusCheerTimer = 5;
        openDialog('Math Race Rally', `Score ${score}%. You need 80% or better, so run the race again when you are ready.`);
      }
      return;
    }
    raceState.current = makeQuestion();
    renderRace();
  }

  function renderStore() {
    const rows = storeItems
      .map((item) => {
        const owned = progression.purchases.includes(item.id);
        const affordable = progression.xp >= item.cost;
        const buttonText = owned ? 'Owned' : affordable ? `Buy - ${item.cost} XP` : `Need ${item.cost} XP`;
        return `
          <article class="store__item">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <button data-store-item="${item.id}" ${owned || !affordable ? 'disabled' : ''}>${buttonText}</button>
          </article>
        `;
      })
      .join('');
    storePanel.innerHTML = `
      <h2>Campus Store</h2>
      <p class="store__balance">${progression.xp} XP available</p>
      <div class="store__grid">${rows}</div>
      <p>Press Space or E to close.</p>
    `;
    storePanel.classList.add('visible');
    storePanel.querySelectorAll('button[data-store-item]').forEach((button) => {
      button.addEventListener('click', () => purchaseStoreItem(button.dataset.storeItem));
    });
  }

  function openStore() {
    if (!quest.complete) {
      showToast('Complete the Math Explorer quest to unlock the store.');
      return;
    }
    renderStore();
  }

  function purchaseStoreItem(itemId) {
    const item = storeItems.find((candidate) => candidate.id === itemId);
    if (!item || progression.purchases.includes(item.id)) return false;
    if (progression.xp < item.cost) {
      showToast(`You need ${item.cost} XP for ${item.name}.`);
      return false;
    }
    progression.xp -= item.cost;
    progression.purchases.push(item.id);
    progression.equipped = item.id;
    campusCheer = `${item.name} purchased!`;
    campusCheerTimer = 6;
    showToast(`Purchased ${item.name}.`);
    renderStore();
    render();
    return true;
  }

  function interact() {
    if (storePanel.classList.contains('visible')) {
      closeStore();
      return;
    }
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
    if (distance(player, store) < 94) {
      openStore();
      return;
    }
    showToast('Move closer to Mrs. Numbers, a rally part, the arcade, or the store.');
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
    if (campusCheerTimer > 0) {
      campusCheerTimer -= dt;
      if (campusCheerTimer <= 0) campusCheer = '';
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

  function drawSheetRegion(key, sx, sy, sw, sh, x, y, w, h, fallback = '#20344b') {
    if (!imageReady(key)) {
      drawFallbackRect(x, y, w, h, fallback);
      return;
    }
    ctx.drawImage(assets[key], sx, sy, sw, sh, Math.round(x - camera.x), Math.round(y - camera.y), w, h);
  }

  function drawSheetTile(tile, x, y) {
    const sourceSize = tile.sourceSize || TILE_SIZE;
    drawSheetRegion(tile.key, tile.sx, tile.sy, sourceSize, sourceSize, x, y, TILE_SIZE, TILE_SIZE);
  }

  function drawTiledSheetRect(tile, x, y, w, h) {
    for (let tileX = x; tileX < x + w; tileX += TILE_SIZE) {
      for (let tileY = y; tileY < y + h; tileY += TILE_SIZE) {
        drawSheetTile(tile, tileX, tileY);
      }
    }
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
        let tile = modernTiles.grass1;
        if ((col + row) % 11 === 0) tile = modernTiles.flowers1;
        else if ((col * row) % 13 === 0) tile = modernTiles.flowers2;
        else if ((col + row) % 5 === 0) tile = modernTiles.grass2;
        else if ((col + row) % 7 === 0) tile = modernTiles.grass3;
        if (col >= 7 && col <= 8) tile = modernTiles.path;
        if (row >= 8 && row <= 9) tile = modernTiles.path;
        drawSheetTile(tile, worldX, worldY);
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

  function drawStoreKiosk() {
    drawProp('desk', store.x, store.y, 58, store.label);
    ctx.save();
    ctx.fillStyle = quest.complete ? '#ffd166' : 'rgba(174, 190, 211, 0.6)';
    ctx.strokeStyle = '#101827';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(Math.round(store.x - camera.x), Math.round(store.y - 36 - camera.y), 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#101827';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('XP', Math.round(store.x - camera.x), Math.round(store.y - 32 - camera.y));
    ctx.restore();
  }

  function drawModernBuilding(key, sx, sy, sw, sh, x, y, w, h, label, labelX, labelY) {
    ctx.save();
    ctx.fillStyle = 'rgba(4, 10, 18, 0.24)';
    ctx.fillRect(Math.round(x - camera.x + 14), Math.round(y - camera.y + h - 24), w - 28, 24);
    ctx.restore();
    drawSheetRegion(key, sx, sy, sw, sh, x, y, w, h, '#172232');
    drawLabel(label, labelX, labelY, 'center');
  }

  function drawEquippedReward() {
    if (!progression.equipped) return;
    const x = Math.round(player.x - camera.x);
    const y = Math.round(player.y - camera.y);
    ctx.save();
    ctx.strokeStyle = progression.equipped === 'neon-backpack' ? '#54f7a7' : '#ffd166';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(x, y + 4, 40 + Math.sin(performance.now() / 180) * 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawSpeechBubble(entity, text) {
    const x = Math.round(entity.x - camera.x);
    const y = Math.round(entity.y - camera.y - 70);
    const width = Math.min(210, Math.max(96, text.length * 7 + 24));
    const height = 30;

    ctx.save();
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(5, 13, 24, 0.88)';
    ctx.strokeStyle = 'rgba(84, 247, 167, 0.78)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - width / 2, y - height, width, height, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f8fbff';
    ctx.fillText(text, x, y - 11);
    ctx.restore();
  }

  function studentLine(student, index) {
    if (campusCheer && index % 2 === 0 && distance(player, student) < 520) return campusCheer;
    if (distance(player, student) > 240) return '';
    const slot = Math.floor((performance.now() / 3600 + index) % student.lines.length);
    const windowOpen = Math.floor(performance.now() / 1800 + index) % 4 === 0;
    return windowOpen ? student.lines[slot] : '';
  }

  function drawObjectiveMarker() {
    const target = objectiveTarget();
    const targetX = Math.round(target.x - camera.x);
    const targetY = Math.round(target.y - camera.y);
    const pulse = Math.sin(performance.now() / 190) * 4;
    const onScreen = targetX > 28 && targetX < canvas.width - 28 && targetY > 42 && targetY < canvas.height - 28;

    ctx.save();
    ctx.strokeStyle = '#ffd166';
    ctx.fillStyle = '#ffd166';
    ctx.lineWidth = 3;

    if (onScreen) {
      ctx.beginPath();
      ctx.arc(targetX, targetY + 4, 34 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(targetX, targetY - 56 + pulse);
      ctx.lineTo(targetX - 10, targetY - 38 + pulse);
      ctx.lineTo(targetX + 10, targetY - 38 + pulse);
      ctx.closePath();
      ctx.fill();
    } else {
      const dx = target.x - player.x;
      const dy = target.y - player.y;
      const angle = Math.atan2(dy, dx);
      const edgeX = Math.max(34, Math.min(canvas.width - 34, canvas.width / 2 + Math.cos(angle) * (canvas.width / 2 - 42)));
      const edgeY = Math.max(44, Math.min(canvas.height - 44, canvas.height / 2 + Math.sin(angle) * (canvas.height / 2 - 52)));
      ctx.translate(edgeX, edgeY);
      ctx.rotate(angle + Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(-12, 10);
      ctx.lineTo(12, 10);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawModernCharacterSprite(entity, label, image) {
    const x = Math.round(entity.x - camera.x);
    const y = Math.round(entity.y - camera.y);
    const frame = Math.floor(performance.now() / 180) % 4;
    const moving = entity === player ? player.moving : true;
    const facing = entity.facing || 'down';
    let sourceX = 3 * 16;
    let sourceY = 0;
    let flip = false;

    if (moving) {
      sourceY = 32;
      sourceX = (18 + frame) * 16;
      if (facing === 'up') sourceX = (6 + frame) * 16;
      if (facing === 'left' || facing === 'right') {
        sourceX = (12 + frame) * 16;
        flip = facing === 'left';
      }
    } else {
      if (facing === 'up') sourceX = 1 * 16;
      if (facing === 'left' || facing === 'right') {
        sourceX = 2 * 16;
        flip = facing === 'left';
      }
    }

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(x - 16, y + 22, 32, 7);

    if (image && image.complete && image.naturalWidth > 0) {
      ctx.translate(x, y);
      if (flip) ctx.scale(-1, 1);
      ctx.drawImage(image, sourceX, sourceY, 16, 32, -20, -40, 40, 64);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 12, y - 24, 24, 42);
    }
    ctx.restore();

    ctx.save();
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(5,8,16,0.86)';
    ctx.fillStyle = '#f8fbff';
    ctx.strokeText(label, x, y - 46);
    ctx.fillText(label, x, y - 46);
    ctx.restore();
  }

  function drawSprite(entity, label) {
    const image = assets[entity.sprite];
    if (entity.sprite?.startsWith('modern')) {
      drawModernCharacterSprite(entity, label, image);
      return;
    }

    const x = Math.round(entity.x - camera.x);
    const y = Math.round(entity.y - camera.y);
    const frame = Math.floor(performance.now() / 160) % 4;
    const moving = entity === player ? player.moving : true;
    const row = entity.facing === 'up' ? 0 : entity.facing === 'down' ? 2 : moving ? 1 : 3;
    const col = moving ? frame : 0;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(x - 18, y + 24, 36, 8);

    if (image && image.complete && image.naturalWidth > 0) {
      const flip = entity.facing === 'left';
      ctx.translate(x, y);
      if (flip) ctx.scale(-1, 1);
      ctx.drawImage(image, col * 96, row * 96, 96, 96, -32, -32, 64, 64);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 12, y - 24, 24, 42);
    }
    ctx.restore();

    ctx.save();
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(5,8,16,0.86)';
    ctx.fillStyle = '#f8fbff';
    ctx.strokeText(label, x, y - 40);
    ctx.fillText(label, x, y - 40);
    ctx.restore();
  }

  function drawCampus() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWorldTiles();

    drawTiledSheetRect(modernTiles.plaza, 424, 346, 792, 464);
    drawTiledSheetRect(modernTiles.path, 390, 760, 890, 128);
    drawTiledSheetRect(modernTiles.path, 450, 220, 128, 910);
    drawTiledSheetRect(modernTiles.plaza, 1320, 560, 448, 384);
    drawTiledSheetRect(modernTiles.interiorFloor, 260, 905, 650, 220);
    drawTiledSheetRect(modernTiles.water, 120, 1040, 240, 160);

    drawModernBuilding('modernSchool', 0, 0, 640, 330, 555, 135, 500, 258, 'MATH HALL', 805, 382);
    drawModernBuilding('modernOffice', 0, 0, 560, 440, 1315, 425, 370, 292, 'NEXUS PLAZA', 1500, 708);
    drawModernBuilding('modernRoom', 0, 1024, 1024, 448, 310, 880, 470, 206, 'STUDY COMMONS', 545, 1074);

    drawProp('arcade', arcade.x, arcade.y, 66, arcade.label);
    if (!quest.raceUnlocked) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      drawFallbackRect(arcade.x - 33, arcade.y - 33, 66, 66, '#06111dcc');
      ctx.restore();
    }
    drawStoreKiosk();

    items.forEach((item) => {
      if (!quest.collected.includes(item.id)) drawQuestItem(item);
    });

    drawObjectiveMarker();

    students.forEach((student, index) => {
      drawSprite(student, student.name);
      const line = studentLine(student, index);
      if (line) drawSpeechBubble(student, line);
    });
    drawSprite(npc, npc.name);
    drawSprite(player, 'You');
    drawEquippedReward();
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
      progression,
      objective: { hint: objectiveHint(), target: objectiveTarget().id || objectiveTarget().label || objectiveTarget().name },
      campusCheer,
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
    awardQuestXp,
    purchaseStoreItem,
    completeQuestForStore() {
      quest.stage = 5;
      quest.complete = true;
      quest.raceUnlocked = true;
      quest.lastScore = 100;
      awardQuestXp();
      update(0);
      render();
    },
    getState() {
      return JSON.parse(renderGameToText());
    },
  };

  updateHud();
  render();
  requestAnimationFrame(loop);
})();
