import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { normalizeGameData } from '../../generation/gameSchema';
import { useCanvasFit } from '../../hooks/useCanvasFit';
import type { GameData } from '../../generation/types';

interface GameRuntime2DProps {
  data: any;
}

type GameState = 'start' | 'playing' | 'paused' | 'gameover' | 'win';

interface GameObject {
  x: number;
  y: number;
  size: number;
  speed: number;
  isGood?: boolean;
}

interface Bullet {
  x: number;
  y: number;
  speed: number;
}

export default function GameRuntime2D({ data }: GameRuntime2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height, mapPointerToCanvas } = useCanvasFit({ canvasRef, containerRef });
  
  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [health, setHealth] = useState(3);
  
  // Re-normalize game data when data prop changes
  const [gameData, setGameData] = useState<GameData>(() => normalizeGameData(data));
  
  const stateRef = useRef<{
    player: { x: number; y: number; size: number; vx: number; vy: number };
    targets: GameObject[];
    bullets: Bullet[];
    keys: Set<string>;
    touches: Map<number, { x: number; y: number }>;
    lastSpawn: number;
    lastShot: number;
    currentSpeed: number;
    currentSpawnRate: number;
    animationId: number | null;
  }>({
    player: { x: 0, y: 0, size: 0, vx: 0, vy: 0 },
    targets: [],
    bullets: [],
    keys: new Set(),
    touches: new Map(),
    lastSpawn: 0,
    lastShot: 0,
    currentSpeed: 0,
    currentSpawnRate: 0,
    animationId: null,
  });

  // Re-normalize and reset when data changes
  useEffect(() => {
    const normalized = normalizeGameData(data);
    setGameData(normalized);
    
    // Cancel any in-flight animation
    if (stateRef.current.animationId) {
      cancelAnimationFrame(stateRef.current.animationId);
      stateRef.current.animationId = null;
    }
    
    // Reset to start state
    setGameState('start');
    setScore(0);
    setLevel(1);
    setHealth(3);
  }, [data]);

  const initGame = () => {
    const state = stateRef.current;
    
    state.player = {
      x: width / 2,
      y: height - 60,
      size: gameData.settings.playerSize,
      vx: 0,
      vy: 0,
    };
    state.targets = [];
    state.bullets = [];
    state.keys.clear();
    state.touches.clear();
    state.lastSpawn = 0;
    state.lastShot = 0;
    state.currentSpeed = gameData.settings.initialSpeed;
    state.currentSpawnRate = gameData.settings.spawnRate;
    
    setScore(0);
    setLevel(1);
    setHealth(3);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
        stateRef.current.keys.add(e.key);
      }
      if (e.key === 'Escape' && gameState === 'playing') {
        setGameState('paused');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();
      const pos = mapPointerToCanvas(e.clientX, e.clientY);
      stateRef.current.touches.set(e.pointerId, pos);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (stateRef.current.touches.has(e.pointerId)) {
        const pos = mapPointerToCanvas(e.clientX, e.clientY);
        stateRef.current.touches.set(e.pointerId, pos);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      stateRef.current.touches.delete(e.pointerId);
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [mapPointerToCanvas]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const state = stateRef.current;
    const isShooter = gameData.gameKind === 'shooter';

    const spawnTarget = () => {
      const isGood = isShooter ? false : Math.random() > 0.3;
      state.targets.push({
        x: Math.random() * (width - gameData.settings.targetSize),
        y: -gameData.settings.targetSize,
        size: gameData.settings.targetSize,
        speed: state.currentSpeed,
        isGood,
      });
    };

    const shootBullet = () => {
      if (isShooter) {
        state.bullets.push({
          x: state.player.x,
          y: state.player.y - state.player.size,
          speed: 8,
        });
      }
    };

    const updatePlayer = (timestamp: number) => {
      const speed = 5;
      
      if (state.keys.has('ArrowLeft')) state.player.vx = -speed;
      else if (state.keys.has('ArrowRight')) state.player.vx = speed;
      else state.player.vx = 0;

      if (state.keys.has('ArrowUp')) state.player.vy = -speed;
      else if (state.keys.has('ArrowDown')) state.player.vy = speed;
      else state.player.vy = 0;

      // Shooting for shooter game
      if (isShooter && state.keys.has(' ') && timestamp - state.lastShot > 250) {
        shootBullet();
        state.lastShot = timestamp;
      }

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

      state.player.x = Math.max(state.player.size, Math.min(width - state.player.size, state.player.x));
      state.player.y = Math.max(state.player.size, Math.min(height - state.player.size, state.player.y));
    };

    const checkCollision = (obj1: { x: number; y: number; size: number }, obj2: { x: number; y: number; size: number }) => {
      const dx = obj1.x - obj2.x;
      const dy = obj1.y - obj2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < (obj1.size + obj2.size) / 2;
    };

    const gameLoop = (timestamp: number) => {
      if (timestamp - state.lastSpawn > state.currentSpawnRate) {
        spawnTarget();
        state.lastSpawn = timestamp;
      }

      updatePlayer(timestamp);

      // Update bullets
      if (isShooter) {
        state.bullets = state.bullets.filter((bullet) => {
          bullet.y -= bullet.speed;
          
          // Check bullet-target collision
          for (let i = state.targets.length - 1; i >= 0; i--) {
            const target = state.targets[i];
            const dx = bullet.x - target.x;
            const dy = bullet.y - target.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < target.size / 2 + 3) {
              // Hit!
              state.targets.splice(i, 1);
              setScore((s) => {
                const newScore = s + 20;
                if (newScore > 0 && newScore % gameData.progression.levelUpScore === 0) {
                  setLevel((l) => {
                    const newLevel = Math.min(l + 1, gameData.progression.maxLevel);
                    state.currentSpeed += gameData.settings.speedIncrement;
                    state.currentSpawnRate = Math.max(400, state.currentSpawnRate - gameData.settings.spawnRateIncrement);
                    return newLevel;
                  });
                }
                return newScore;
              });
              return false; // Remove bullet
            }
          }
          
          return bullet.y > 0; // Keep bullet if still on screen
        });
      }

      let missedGood = false;
      state.targets = state.targets.filter((target) => {
        target.y += target.speed;

        if (checkCollision(state.player, target)) {
          if (isShooter || !target.isGood) {
            // Hit by enemy
            setHealth((h) => {
              const newHealth = h - 1;
              if (newHealth <= 0) {
                setGameState('gameover');
              }
              return newHealth;
            });
          } else {
            // Caught good item
            setScore((s) => {
              const newScore = s + 10;
              if (newScore > 0 && newScore % gameData.progression.levelUpScore === 0) {
                setLevel((l) => {
                  const newLevel = Math.min(l + 1, gameData.progression.maxLevel);
                  state.currentSpeed += gameData.settings.speedIncrement;
                  state.currentSpawnRate = Math.max(400, state.currentSpawnRate - gameData.settings.spawnRateIncrement);
                  return newLevel;
                });
              }
              return newScore;
            });
          }
          return false;
        }

        if (target.y > height + target.size) {
          if (!isShooter && target.isGood) {
            missedGood = true;
          }
          return false;
        }

        return true;
      });

      if (missedGood) {
        setHealth((h) => {
          const newHealth = h - 1;
          if (newHealth <= 0) {
            setGameState('gameover');
          }
          return newHealth;
        });
      }

      // Render
      ctx.fillStyle = gameData.theme.background;
      ctx.fillRect(0, 0, width, height);

      // Draw player
      ctx.fillStyle = gameData.theme.player;
      ctx.beginPath();
      if (isShooter) {
        // Draw triangle for shooter
        ctx.moveTo(state.player.x, state.player.y - state.player.size);
        ctx.lineTo(state.player.x - state.player.size, state.player.y + state.player.size);
        ctx.lineTo(state.player.x + state.player.size, state.player.y + state.player.size);
        ctx.closePath();
      } else {
        ctx.arc(state.player.x, state.player.y, state.player.size, 0, Math.PI * 2);
      }
      ctx.fill();

      // Draw bullets
      if (isShooter) {
        ctx.fillStyle = gameData.theme.primary;
        state.bullets.forEach((bullet) => {
          ctx.beginPath();
          ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Draw targets
      state.targets.forEach((target) => {
        ctx.fillStyle = target.isGood ? gameData.theme.target : gameData.theme.secondary;
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.size / 2, 0, Math.PI * 2);
        ctx.fill();
      });

      if (gameState === 'playing') {
        state.animationId = requestAnimationFrame(gameLoop);
      }
    };

    state.animationId = requestAnimationFrame(gameLoop);

    return () => {
      if (state.animationId) {
        cancelAnimationFrame(state.animationId);
      }
    };
  }, [gameState, width, height, gameData]);

  const handleStart = () => {
    initGame();
    setGameState('playing');
  };

  const handlePause = () => {
    setGameState('paused');
  };

  const handleResume = () => {
    setGameState('playing');
  };

  const handleRestart = () => {
    initGame();
    setGameState('playing');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg sm:text-xl">{gameData.title}</CardTitle>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <span>{gameData.hud.scoreLabel}: {score}</span>
            <span>{gameData.hud.levelLabel}: {level}</span>
            {gameData.hud.healthLabel && <span>{gameData.hud.healthLabel}: {health}</span>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="relative w-full">
          <canvas
            ref={canvasRef}
            className="w-full border rounded-lg bg-muted touch-none"
            style={{ display: 'block' }}
          />
          
          {gameState === 'start' && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
              <div className="text-center space-y-4 p-6">
                <h3 className="text-2xl font-bold">{gameData.title}</h3>
                <p className="text-muted-foreground max-w-md">{gameData.instructions}</p>
                <Button onClick={handleStart} size="lg" className="gap-2">
                  <Play className="w-4 h-4" />
                  Start Game
                </Button>
              </div>
            </div>
          )}

          {gameState === 'paused' && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
              <div className="text-center space-y-4 p-6">
                <h3 className="text-2xl font-bold">Paused</h3>
                <div className="flex gap-2">
                  <Button onClick={handleResume} size="lg" className="gap-2">
                    <Play className="w-4 h-4" />
                    Resume
                  </Button>
                  <Button onClick={handleRestart} size="lg" variant="outline" className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Restart
                  </Button>
                </div>
              </div>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-lg">
              <div className="text-center space-y-4 p-6">
                <h3 className="text-3xl font-bold text-destructive">Game Over</h3>
                <div className="space-y-2">
                  <p className="text-xl font-semibold">Final Score: {score}</p>
                  <p className="text-lg text-muted-foreground">Level: {level}</p>
                </div>
                <Button onClick={handleRestart} size="lg" className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </Button>
              </div>
            </div>
          )}
        </div>

        {gameState === 'playing' && (
          <div className="flex gap-2">
            <Button onClick={handlePause} variant="outline" className="gap-2">
              <Pause className="w-4 h-4" />
              Pause
            </Button>
            <Button onClick={handleRestart} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Restart
            </Button>
          </div>
        )}

        <p className="text-sm text-muted-foreground text-center">
          {gameState === 'start' || gameState === 'paused' 
            ? gameData.instructions 
            : gameData.gameKind === 'shooter' 
              ? 'Arrow keys to move, Space to shoot' 
              : 'Use arrow keys or touch to move'}
        </p>
      </CardContent>
    </Card>
  );
}
