import type { GameData } from './types';

export function normalizeGameData(data: any): GameData {
  const defaults: GameData = {
    title: 'Catch Game',
    instructions: 'Move to catch falling items and avoid obstacles!',
    gameKind: 'catch',
    difficulty: 'medium',
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
      loseCondition: 'Miss too many items or hit obstacles',
    },
    progression: {
      levelUpScore: 100,
      maxLevel: 10,
    },
  };

  if (!data || typeof data !== 'object') {
    return defaults;
  }

  return {
    title: typeof data.title === 'string' ? data.title : defaults.title,
    instructions: typeof data.instructions === 'string' ? data.instructions : defaults.instructions,
    gameKind: ['runner', 'shooter', 'catch', 'puzzle', 'space'].includes(data.gameKind)
      ? data.gameKind
      : defaults.gameKind,
    difficulty: ['easy', 'medium', 'hard'].includes(data.difficulty)
      ? data.difficulty
      : defaults.difficulty,
    theme: {
      primary: data.theme?.primary || defaults.theme.primary,
      secondary: data.theme?.secondary || defaults.theme.secondary,
      background: data.theme?.background || defaults.theme.background,
      player: data.theme?.player || defaults.theme.player,
      target: data.theme?.target || defaults.theme.target,
    },
    settings: {
      initialSpeed: typeof data.settings?.initialSpeed === 'number' ? data.settings.initialSpeed : defaults.settings.initialSpeed,
      speedIncrement: typeof data.settings?.speedIncrement === 'number' ? data.settings.speedIncrement : defaults.settings.speedIncrement,
      spawnRate: typeof data.settings?.spawnRate === 'number' ? data.settings.spawnRate : defaults.settings.spawnRate,
      spawnRateIncrement: typeof data.settings?.spawnRateIncrement === 'number' ? data.settings.spawnRateIncrement : defaults.settings.spawnRateIncrement,
      targetSize: typeof data.settings?.targetSize === 'number' ? data.settings.targetSize : defaults.settings.targetSize,
      playerSize: typeof data.settings?.playerSize === 'number' ? data.settings.playerSize : defaults.settings.playerSize,
    },
    hud: {
      scoreLabel: data.hud?.scoreLabel || defaults.hud.scoreLabel,
      levelLabel: data.hud?.levelLabel || defaults.hud.levelLabel,
      healthLabel: data.hud?.healthLabel,
    },
    objectives: {
      winCondition: data.objectives?.winCondition,
      loseCondition: data.objectives?.loseCondition || defaults.objectives.loseCondition,
    },
    progression: {
      levelUpScore: typeof data.progression?.levelUpScore === 'number' ? data.progression.levelUpScore : defaults.progression.levelUpScore,
      maxLevel: typeof data.progression?.maxLevel === 'number' ? data.progression.maxLevel : defaults.progression.maxLevel,
    },
  };
}
