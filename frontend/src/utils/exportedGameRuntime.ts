import type { GameData } from '../generation/types';

export function generateGameRuntimeScript(gameData: GameData): string {
  return `
    const gameData = ${JSON.stringify(gameData)};
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    let gameState = 'start';
    let score = 0;
    let level = 1;
    let health = 3;
    
    const state = {
      player: { x: 0, y: 0, size: gameData.settings.playerSize, vx: 0, vy: 0 },
      targets: [],
      keys: new Set(),
      touches: new Map(),
      lastSpawn: 0,
      currentSpeed: gameData.settings.initialSpeed,
      currentSpawnRate: gameData.settings.spawnRate,
      animationId: null,
    };
    
    function initGame() {
      state.player = {
        x: canvas.width / 2,
        y: canvas.height - 60,
        size: gameData.settings.playerSize,
        vx: 0,
        vy: 0,
      };
      state.targets = [];
      state.keys.clear();
      state.touches.clear();
      state.lastSpawn = 0;
      state.currentSpeed = gameData.settings.initialSpeed;
      state.currentSpawnRate = gameData.settings.spawnRate;
      score = 0;
      level = 1;
      health = 3;
      updateHUD();
    }
    
    function updateHUD() {
      document.getElementById('score').textContent = score;
      document.getElementById('level').textContent = level;
      if (gameData.hud.healthLabel) {
        document.getElementById('health').textContent = health;
      }
    }
    
    function showOverlay(type) {
      document.getElementById('startOverlay').style.display = type === 'start' ? 'flex' : 'none';
      document.getElementById('pausedOverlay').style.display = type === 'paused' ? 'flex' : 'none';
      document.getElementById('gameoverOverlay').style.display = type === 'gameover' ? 'flex' : 'none';
    }
    
    function startGame() {
      initGame();
      gameState = 'playing';
      showOverlay('none');
      gameLoop(performance.now());
    }
    
    function pauseGame() {
      gameState = 'paused';
      showOverlay('paused');
      if (state.animationId) cancelAnimationFrame(state.animationId);
    }
    
    function resumeGame() {
      gameState = 'playing';
      showOverlay('none');
      gameLoop(performance.now());
    }
    
    function restartGame() {
      startGame();
    }
    
    function spawnTarget() {
      const isGood = Math.random() > 0.3;
      state.targets.push({
        x: Math.random() * (canvas.width - gameData.settings.targetSize),
        y: -gameData.settings.targetSize,
        size: gameData.settings.targetSize,
        speed: state.currentSpeed,
        isGood,
      });
    }
    
    function updatePlayer() {
      const speed = 5;
      
      if (state.keys.has('ArrowLeft')) state.player.vx = -speed;
      else if (state.keys.has('ArrowRight')) state.player.vx = speed;
      else state.player.vx = 0;
      
      if (state.keys.has('ArrowUp')) state.player.vy = -speed;
      else if (state.keys.has('ArrowDown')) state.player.vy = speed;
      else state.player.vy = 0;
      
      if (state.touches.size > 0) {
        const touch = Array.from(state.touches.values())[0];
        const dx = touch.x - state.player.x;
        const dy = touch.y - state.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 10) {
          state.player.vx = (dx / dist) * speed;
          state.player.vy = (dy / dist) * speed;
        }
      }
      
      state.player.x += state.player.vx;
      state.player.y += state.player.vy;
      
      state.player.x = Math.max(state.player.size, Math.min(canvas.width - state.player.size, state.player.x));
      state.player.y = Math.max(state.player.size, Math.min(canvas.height - state.player.size, state.player.y));
    }
    
    function checkCollision(obj1, obj2) {
      const dx = obj1.x - obj2.x;
      const dy = obj1.y - obj2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < (obj1.size + obj2.size) / 2;
    }
    
    function gameLoop(timestamp) {
      if (gameState !== 'playing') return;
      
      if (timestamp - state.lastSpawn > state.currentSpawnRate) {
        spawnTarget();
        state.lastSpawn = timestamp;
      }
      
      updatePlayer();
      
      let missedGood = false;
      state.targets = state.targets.filter((target) => {
        target.y += target.speed;
        
        if (checkCollision(state.player, target)) {
          if (target.isGood) {
            score += 10;
            if (score > 0 && score % gameData.progression.levelUpScore === 0) {
              level = Math.min(level + 1, gameData.progression.maxLevel);
              state.currentSpeed += gameData.settings.speedIncrement;
              state.currentSpawnRate = Math.max(400, state.currentSpawnRate - gameData.settings.spawnRateIncrement);
            }
            updateHUD();
          } else {
            health--;
            updateHUD();
            if (health <= 0) {
              gameState = 'gameover';
              document.getElementById('finalScore').textContent = score;
              document.getElementById('finalLevel').textContent = level;
              showOverlay('gameover');
              return false;
            }
          }
          return false;
        }
        
        if (target.y > canvas.height + target.size) {
          if (target.isGood) missedGood = true;
          return false;
        }
        
        return true;
      });
      
      if (missedGood) {
        health--;
        updateHUD();
        if (health <= 0) {
          gameState = 'gameover';
          document.getElementById('finalScore').textContent = score;
          document.getElementById('finalLevel').textContent = level;
          showOverlay('gameover');
          return;
        }
      }
      
      ctx.fillStyle = gameData.theme.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = gameData.theme.player;
      ctx.beginPath();
      ctx.arc(state.player.x, state.player.y, state.player.size, 0, Math.PI * 2);
      ctx.fill();
      
      state.targets.forEach((target) => {
        ctx.fillStyle = target.isGood ? gameData.theme.target : gameData.theme.secondary;
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.size / 2, 0, Math.PI * 2);
        ctx.fill();
      });
      
      state.animationId = requestAnimationFrame(gameLoop);
    }
    
    // Event listeners
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
        state.keys.add(e.key);
      }
      if (e.key === 'Escape' && gameState === 'playing') {
        pauseGame();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      state.keys.delete(e.key);
    });
    
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
      state.touches.set(e.pointerId, { x, y });
    });
    
    canvas.addEventListener('pointermove', (e) => {
      if (state.touches.has(e.pointerId)) {
        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
        const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
        state.touches.set(e.pointerId, { x, y });
      }
    });
    
    canvas.addEventListener('pointerup', (e) => {
      state.touches.delete(e.pointerId);
    });
    
    canvas.addEventListener('pointercancel', (e) => {
      state.touches.delete(e.pointerId);
    });
    
    // Button handlers
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('pauseBtn').addEventListener('click', pauseGame);
    document.getElementById('resumeBtn').addEventListener('click', resumeGame);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.getElementById('restartBtn2').addEventListener('click', restartGame);
    
    // Initialize
    showOverlay('start');
  `;
}

export function generateGameRuntimeStyles(): string {
  return `
    .game-container {
      max-width: 800px;
      margin: 40px auto;
      padding: 24px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }
    .game-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .game-title {
      font-size: 24px;
      font-weight: 700;
      color: oklch(0.25 0.02 264);
    }
    .game-hud {
      display: flex;
      gap: 16px;
      font-size: 14px;
      font-weight: 600;
    }
    .canvas-container {
      position: relative;
      width: 100%;
    }
    #gameCanvas {
      width: 100%;
      height: auto;
      max-height: 600px;
      border: 2px solid oklch(0.85 0.01 264);
      border-radius: 12px;
      background: oklch(0.96 0.005 264);
      display: block;
      touch-action: none;
    }
    .overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
    }
    .overlay-content {
      text-align: center;
      padding: 32px;
      max-width: 400px;
    }
    .overlay-title {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 16px;
      color: oklch(0.25 0.02 264);
    }
    .overlay-text {
      font-size: 16px;
      color: oklch(0.45 0.02 264);
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .overlay-score {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .game-controls {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }
    .game-btn {
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .game-btn-primary {
      background: oklch(0.55 0.15 264);
      color: white;
    }
    .game-btn-primary:hover {
      background: oklch(0.50 0.15 264);
    }
    .game-btn-secondary {
      background: oklch(0.96 0.005 264);
      color: oklch(0.25 0.02 264);
      border: 1px solid oklch(0.85 0.01 264);
    }
    .game-btn-secondary:hover {
      background: oklch(0.92 0.01 264);
    }
    .game-btn:active {
      transform: scale(0.98);
    }
    .game-instructions {
      text-align: center;
      margin-top: 16px;
      font-size: 14px;
      color: oklch(0.45 0.02 264);
    }
    @media (max-width: 640px) {
      .game-container {
        margin: 20px auto;
        padding: 16px;
      }
      .game-title {
        font-size: 20px;
      }
      .overlay-title {
        font-size: 24px;
      }
    }
  `;
}
