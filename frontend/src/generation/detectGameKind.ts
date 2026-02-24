import type { GameData } from './types';

export type GameKind = GameData['gameKind'];

export interface GameKindDetection {
  kind: GameKind;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

/**
 * Detects game kind from prompt with weighted keyword scoring.
 * Shooter keywords take precedence over generic space keywords.
 */
export function detectGameKind(prompt: string): GameKindDetection {
  const keywords = prompt.toLowerCase();
  
  // Shooter detection - highest priority
  const shooterKeywords = ['shoot', 'shooter', 'gun', 'fire', 'bullet', 'weapon', 'enemy', 'enemies'];
  const shooterScore = shooterKeywords.filter(kw => keywords.includes(kw)).length;
  
  if (shooterScore > 0) {
    return {
      kind: 'shooter',
      confidence: shooterScore >= 2 ? 'high' : 'medium',
      reason: `Contains shooter keywords: ${shooterKeywords.filter(kw => keywords.includes(kw)).join(', ')}`,
    };
  }
  
  // Runner detection
  const runnerKeywords = ['run', 'runner', 'jump', 'obstacle', 'endless'];
  const runnerScore = runnerKeywords.filter(kw => keywords.includes(kw)).length;
  
  if (runnerScore > 0) {
    return {
      kind: 'runner',
      confidence: runnerScore >= 2 ? 'high' : 'medium',
      reason: `Contains runner keywords: ${runnerKeywords.filter(kw => keywords.includes(kw)).join(', ')}`,
    };
  }
  
  // Puzzle detection
  const puzzleKeywords = ['puzzle', 'match', 'pattern', 'solve', 'logic'];
  const puzzleScore = puzzleKeywords.filter(kw => keywords.includes(kw)).length;
  
  if (puzzleScore > 0) {
    return {
      kind: 'puzzle',
      confidence: puzzleScore >= 2 ? 'high' : 'medium',
      reason: `Contains puzzle keywords: ${puzzleKeywords.filter(kw => keywords.includes(kw)).join(', ')}`,
    };
  }
  
  // Catch detection
  const catchKeywords = ['catch', 'collect', 'grab', 'gather', 'pick'];
  const catchScore = catchKeywords.filter(kw => keywords.includes(kw)).length;
  
  if (catchScore > 0) {
    return {
      kind: 'catch',
      confidence: catchScore >= 2 ? 'high' : 'medium',
      reason: `Contains catch keywords: ${catchKeywords.filter(kw => keywords.includes(kw)).join(', ')}`,
    };
  }
  
  // Space detection - lower priority than specific game types
  const spaceKeywords = ['space', 'star', 'galaxy', 'asteroid', 'planet', 'cosmic'];
  const spaceScore = spaceKeywords.filter(kw => keywords.includes(kw)).length;
  
  if (spaceScore > 0) {
    return {
      kind: 'space',
      confidence: spaceScore >= 2 ? 'high' : 'medium',
      reason: `Contains space keywords: ${spaceKeywords.filter(kw => keywords.includes(kw)).join(', ')}`,
    };
  }
  
  // Default fallback
  return {
    kind: 'catch',
    confidence: 'low',
    reason: 'No specific keywords detected, using default',
  };
}

/**
 * Get a user-friendly label for the detected game kind
 */
export function getGameKindLabel(kind: GameKind): string {
  const labels: Record<GameKind, string> = {
    runner: 'Runner',
    shooter: 'Shooter',
    catch: 'Catch',
    puzzle: 'Puzzle',
    space: 'Space',
  };
  return labels[kind];
}
