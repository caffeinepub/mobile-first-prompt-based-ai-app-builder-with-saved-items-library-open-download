import type { GameData } from './types';
import { detectGameKind, type GameKind } from './detectGameKind';

interface GameTemplate {
  gameKind: GameData['gameKind'];
  title: string;
  instructions: string;
  difficulty: GameData['difficulty'];
  theme: GameData['theme'];
  settings: GameData['settings'];
  hud: GameData['hud'];
  objectives: GameData['objectives'];
  progression: GameData['progression'];
}

const templates: Record<string, GameTemplate> = {
  runner: {
    gameKind: 'runner',
    title: 'Endless Runner',
    instructions: 'Jump over obstacles and survive as long as possible! Use arrow keys or tap to jump.',
    difficulty: 'medium',
    theme: {
      primary: 'oklch(0.55 0.20 142)',
      secondary: 'oklch(0.45 0.15 30)',
      background: 'oklch(0.85 0.05 220)',
      player: 'oklch(0.55 0.20 142)',
      target: 'oklch(0.45 0.15 30)',
    },
    settings: {
      initialSpeed: 3,
      speedIncrement: 0.4,
      spawnRate: 1500,
      spawnRateIncrement: 100,
      targetSize: 35,
      playerSize: 25,
    },
    hud: {
      scoreLabel: 'Distance',
      levelLabel: 'Speed',
    },
    objectives: {
      loseCondition: 'Hit an obstacle',
    },
    progression: {
      levelUpScore: 50,
      maxLevel: 15,
    },
  },
  shooter: {
    gameKind: 'shooter',
    title: 'Space Shooter',
    instructions: 'Shoot down enemies and survive! Use arrow keys to move and space to shoot.',
    difficulty: 'hard',
    theme: {
      primary: 'oklch(0.60 0.25 264)',
      secondary: 'oklch(0.50 0.20 0)',
      background: 'oklch(0.15 0.05 264)',
      player: 'oklch(0.60 0.25 264)',
      target: 'oklch(0.50 0.20 0)',
    },
    settings: {
      initialSpeed: 2.5,
      speedIncrement: 0.35,
      spawnRate: 1200,
      spawnRateIncrement: 80,
      targetSize: 30,
      playerSize: 22,
    },
    hud: {
      scoreLabel: 'Score',
      levelLabel: 'Wave',
      healthLabel: 'Health',
    },
    objectives: {
      loseCondition: 'Health reaches zero',
    },
    progression: {
      levelUpScore: 150,
      maxLevel: 12,
    },
  },
  catch: {
    gameKind: 'catch',
    title: 'Catch Game',
    instructions: 'Catch falling items and avoid obstacles! Move with arrow keys or touch.',
    difficulty: 'easy',
    theme: {
      primary: 'oklch(0.488 0.243 264.376)',
      secondary: 'oklch(0.646 0.222 41.116)',
      background: 'oklch(0.97 0 0)',
      player: 'oklch(0.488 0.243 264.376)',
      target: 'oklch(0.646 0.222 41.116)',
    },
    settings: {
      initialSpeed: 2,
      speedIncrement: 0.3,
      spawnRate: 1000,
      spawnRateIncrement: 50,
      targetSize: 30,
      playerSize: 20,
    },
    hud: {
      scoreLabel: 'Score',
      levelLabel: 'Level',
    },
    objectives: {
      loseCondition: 'Miss too many items',
    },
    progression: {
      levelUpScore: 100,
      maxLevel: 10,
    },
  },
  puzzle: {
    gameKind: 'puzzle',
    title: 'Match Puzzle',
    instructions: 'Match falling patterns to score points! Use arrow keys or touch to move.',
    difficulty: 'medium',
    theme: {
      primary: 'oklch(0.65 0.22 330)',
      secondary: 'oklch(0.55 0.18 280)',
      background: 'oklch(0.95 0.02 280)',
      player: 'oklch(0.65 0.22 330)',
      target: 'oklch(0.55 0.18 280)',
    },
    settings: {
      initialSpeed: 1.8,
      speedIncrement: 0.25,
      spawnRate: 1400,
      spawnRateIncrement: 70,
      targetSize: 32,
      playerSize: 24,
    },
    hud: {
      scoreLabel: 'Matches',
      levelLabel: 'Level',
    },
    objectives: {
      loseCondition: 'Too many mismatches',
    },
    progression: {
      levelUpScore: 80,
      maxLevel: 12,
    },
  },
  space: {
    gameKind: 'space',
    title: 'Space Adventure',
    instructions: 'Navigate through space and collect stars! Use arrow keys or touch to move.',
    difficulty: 'medium',
    theme: {
      primary: 'oklch(0.70 0.15 200)',
      secondary: 'oklch(0.80 0.20 60)',
      background: 'oklch(0.10 0.05 264)',
      player: 'oklch(0.70 0.15 200)',
      target: 'oklch(0.80 0.20 60)',
    },
    settings: {
      initialSpeed: 2.2,
      speedIncrement: 0.32,
      spawnRate: 1100,
      spawnRateIncrement: 60,
      targetSize: 28,
      playerSize: 20,
    },
    hud: {
      scoreLabel: 'Stars',
      levelLabel: 'Sector',
    },
    objectives: {
      loseCondition: 'Hit asteroids',
    },
    progression: {
      levelUpScore: 120,
      maxLevel: 10,
    },
  },
};

export function getGameTemplate(prompt: string, overrideKind?: GameKind): GameData {
  const keywords = prompt.toLowerCase();
  
  // Use override if provided, otherwise detect
  const gameKind = overrideKind || detectGameKind(prompt).kind;
  
  // Get base template
  const baseTemplate = templates[gameKind];
  
  // Detect difficulty from prompt
  let difficulty: GameData['difficulty'] = baseTemplate.difficulty;
  if (keywords.includes('easy') || keywords.includes('simple') || keywords.includes('beginner')) {
    difficulty = 'easy';
  } else if (keywords.includes('hard') || keywords.includes('difficult') || keywords.includes('challenge')) {
    difficulty = 'hard';
  }
  
  return {
    ...baseTemplate,
    difficulty,
  };
}
