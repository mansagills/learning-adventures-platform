(function () {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const hud = document.getElementById('hud');
  const toast = document.getElementById('toast');
  const dialog = document.getElementById('dialog');
  const race = document.getElementById('race');

  const world = { width: 1920, height: 1280 };
  const keys = new Set();
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
  const npc = { id: 'mrs-numbers', name: 'Mrs. Numbers', x: 940, y: 400 };
  const arcade = { id: 'math-race-rally', label: 'Math Race Rally', x: 720, y: 375 };
  const player = { x: 1260, y: 760, speed: 190, facing: 1 };
  const students = [
    { name: 'Maya', x: 1260, y: 520, color: '#ff5ca8', route: [[1260, 520], [1450, 560], [1420, 750]] },
    { name: 'Theo', x: 410, y: 850, color: '#54f7a7', route: [[410, 850], [610, 900], [660, 760]] },
    { name: 'Ari', x: 1040, y: 930, color: '#ffd166', route: [[1040, 930], [1210, 880], [1180, 1030]] },
    { name: 'June', x: 530, y: 420, color: '#39d9ff', route: [[530, 420], [650, 500], [500, 620]] },
    { name: 'Sol', x: 1510, y: 920, color: '#b58cff', route: [[1510, 920], [1600, 720], [1390, 720]] },
    { name: 'Nia', x: 870, y: 1040, color: '#ff8f4c', route: [[870, 1040], [760, 940], [930, 900]] },
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

  function update(dt) {
    let dx = 0;
    let dy = 0;
    if (keys.has('arrowleft') || keys.has('a')) dx -= 1;
    if (keys.has('arrowright') || keys.has('d')) dx += 1;
    if (keys.has('arrowup') || keys.has('w')) dy -= 1;
    if (keys.has('arrowdown') || keys.has('s')) dy += 1;
    const len = Math.hypot(dx, dy) || 1;
    player.x = Math.max(70, Math.min(world.width - 70, player.x + (dx / len) * player.speed * dt));
    player.y = Math.max(70, Math.min(world.height - 70, player.y + (dy / len) * player.speed * dt));
    if (dx !== 0) player.facing = Math.sign(dx);

    students.forEach((student, index) => {
      const routeIndex = Math.floor((performance.now() / 1800 + index) % student.route.length);
      const target = student.route[routeIndex];
      student.x += (target[0] - student.x) * Math.min(1, dt * 1.7);
      student.y += (target[1] - student.y) * Math.min(1, dt * 1.7);
    });

    camera.x = Math.max(0, Math.min(world.width - canvas.width, player.x - canvas.width / 2));
    camera.y = Math.max(0, Math.min(world.height - canvas.height, player.y - canvas.height / 2));
    if (toastTimer > 0) {
      toastTimer -= dt;
      if (toastTimer <= 0) toast.classList.remove('visible');
    }
  }

  function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x - camera.x), Math.round(y - camera.y), w, h);
  }

  function drawSprite(entity, color, label) {
    const x = Math.round(entity.x - camera.x);
    const y = Math.round(entity.y - camera.y);
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(x - 14, y + 14, 28, 6);
    ctx.fillStyle = color;
    ctx.fillRect(x - 10, y - 18, 20, 28);
    ctx.fillStyle = '#f8fbff';
    ctx.fillRect(x - 6, y - 26, 12, 10);
    ctx.fillStyle = '#08111c';
    ctx.fillRect(x - 4, y - 22, 3, 3);
    ctx.fillRect(x + 2, y - 22, 3, 3);
    ctx.fillStyle = '#f8fbff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y - 34);
  }

  function drawCampus() {
    ctx.fillStyle = '#0a1320';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let x = -camera.x % 64; x < canvas.width; x += 64) {
      for (let y = -camera.y % 64; y < canvas.height; y += 64) {
        ctx.fillStyle = (Math.floor((x + camera.x) / 64) + Math.floor((y + camera.y) / 64)) % 2
          ? '#0e1b2b'
          : '#102036';
        ctx.fillRect(x, y, 64, 64);
      }
    }

    drawRect(360, 250, 920, 560, '#17263a');
    drawRect(390, 280, 860, 500, '#1d324a');
    drawRect(390, 280, 860, 34, '#39d9ff');
    drawRect(1330, 530, 430, 390, '#17263a');
    drawRect(1360, 560, 370, 330, '#24364d');
    drawRect(260, 890, 640, 250, '#17263a');
    drawRect(290, 920, 580, 190, '#20344b');

    ctx.fillStyle = '#f8fbff';
    ctx.font = '18px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('MATH HALL', 420 - camera.x, 305 - camera.y);
    ctx.fillText('NEXUS PLAZA', 1380 - camera.x, 590 - camera.y);
    ctx.fillText('STUDY COMMONS', 320 - camera.x, 955 - camera.y);

    drawRect(arcade.x - 28, arcade.y - 35, 56, 70, '#101827');
    drawRect(arcade.x - 19, arcade.y - 25, 38, 26, quest.raceUnlocked ? '#54f7a7' : '#697386');
    ctx.fillStyle = '#f8fbff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(arcade.label, arcade.x - camera.x, arcade.y + 55 - camera.y);

    items.forEach((item) => {
      if (quest.collected.includes(item.id)) return;
      drawRect(item.x - 14, item.y - 14, 28, 28, '#ffd166');
      drawRect(item.x - 7, item.y - 22, 14, 8, '#39d9ff');
      ctx.fillStyle = '#f8fbff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, item.x - camera.x, item.y + 34 - camera.y);
    });

    students.forEach((student) => drawSprite(student, student.color, student.name));
    drawSprite(npc, '#b58cff', npc.name);
    drawSprite(player, '#ffffff', 'You');
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

  window.advanceTime = (ms) => {
    const steps = Math.max(1, Math.round(ms / (1000 / 60)));
    for (let index = 0; index < steps; index += 1) update(1 / 60);
    render();
  };

  window.render_game_to_text = () =>
    JSON.stringify({
      coordinateSystem: 'origin top-left, x right, y down',
      player: { x: Math.round(player.x), y: Math.round(player.y) },
      quest,
      visibleItems: items.filter((item) => !quest.collected.includes(item.id)).map((item) => item.id),
      race: {
        active: raceState.active,
        questionIndex: raceState.questionIndex,
        correct: raceState.correct,
      },
    });

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
      return JSON.parse(window.render_game_to_text());
    },
  };

  updateHud();
  render();
  requestAnimationFrame(loop);
})();
