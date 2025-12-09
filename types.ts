export type CardType = 'PENALTY' | 'REWARD';

export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  description?: string;
}

export interface Player {
  id: string;
  name: string;
}

export interface CardOwnership {
  [cardId: string]: string | null; // Player ID or null if unassigned
}

export interface Move {
  cardId: string;
  fromPlayerId: string | null;
  toPlayerId: string;
}

export interface HistoryEntry {
  holeNumber: number;
  timestamp: string;
  moves: Move[];
  ownershipSnapshot: CardOwnership;
}

export type GameStatus = 'SETUP' | 'PLAYING' | 'FINISHED';

export interface GameState {
  players: Player[];
  ownership: CardOwnership;
  currentHole: number;
  history: HistoryEntry[];
  status: GameStatus;
}