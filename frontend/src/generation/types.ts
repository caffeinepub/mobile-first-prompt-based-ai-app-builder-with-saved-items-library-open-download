export type CreationType = 'app' | 'website' | 'chatbot' | 'image' | 'game';

export interface CreationDraft {
  type: CreationType;
  prompt: string;
  data: any;
  createdAt: number;
}

export interface AppData {
  appKind?: 'calculator' | 'task-list';
  mode?: 'basic' | 'scientific';
  title?: string;
  tasks?: Array<{ text: string; completed: boolean }>;
  actions?: string[];
}

export interface GameData {
  title: string;
  instructions: string;
  gameKind: 'runner' | 'shooter' | 'catch' | 'puzzle' | 'space';
  difficulty: 'easy' | 'medium' | 'hard';
  theme: {
    primary: string;
    secondary: string;
    background: string;
    player: string;
    target: string;
  };
  settings: {
    initialSpeed: number;
    speedIncrement: number;
    spawnRate: number;
    spawnRateIncrement: number;
    targetSize: number;
    playerSize: number;
  };
  hud: {
    scoreLabel: string;
    levelLabel: string;
    healthLabel?: string;
  };
  objectives: {
    winCondition?: string;
    loseCondition: string;
  };
  progression: {
    levelUpScore: number;
    maxLevel: number;
  };
}
