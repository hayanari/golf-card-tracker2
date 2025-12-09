import { useState, useEffect } from 'react';
import { GameState, Player, CardOwnership, HistoryEntry, Move } from '../types';
import { STORAGE_KEY, ALL_CARDS, MAX_HOLES } from '../constants';

// Factory function to ensure we always get a fresh state object
const getInitialState = (): GameState => ({
  players: [],
  ownership: {},
  currentHole: 1,
  history: [],
  status: 'SETUP',
});

// Safe ID generator for older browsers
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const useGame = () => {
  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Robust data sanitization to prevent crashes
        if (!parsed.players) parsed.players = [];
        if (!parsed.ownership) parsed.ownership = {};
        
        // Ensure currentHole is a number
        parsed.currentHole = parseInt(String(parsed.currentHole || 1), 10);
        if (isNaN(parsed.currentHole)) parsed.currentHole = 1;
        
        if (!parsed.history) parsed.history = [];
        if (!parsed.status) parsed.status = 'SETUP';
        
        return parsed;
      }
      return getInitialState();
    } catch (e) {
      console.error("Failed to load state", e);
      return getInitialState();
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addPlayer = (name: string) => {
    if (state.players.length >= 4) return;
    const newPlayer: Player = { id: generateId(), name };
    setState(prev => ({ ...prev, players: [...prev.players, newPlayer] }));
  };

  const removePlayer = (id: string) => {
    setState(prev => ({ ...prev, players: prev.players.filter(p => p.id !== id) }));
  };

  const startGame = (distribution: 'NONE' | 'RANDOM' | 'MANUAL', manualAssignments?: CardOwnership) => {
    // Use functional update to ensure we use the latest 'players' state 
    setState(prev => {
        let initialOwnership: CardOwnership = {};
        
        // Initialize all cards to null first
        ALL_CARDS.forEach(c => initialOwnership[c.id] = null);

        if (distribution === 'RANDOM') {
          const playerIds = prev.players.map(p => p.id);
          if (playerIds.length > 0) {
            const shuffledCards = [...ALL_CARDS].sort(() => 0.5 - Math.random());
            shuffledCards.forEach((card, index) => {
              initialOwnership[card.id] = playerIds[index % playerIds.length];
            });
          }
        } else if (distribution === 'MANUAL' && manualAssignments) {
          initialOwnership = { ...initialOwnership, ...manualAssignments };
        }

        return {
          ...prev,
          ownership: initialOwnership,
          status: 'PLAYING',
          currentHole: 1,
          history: []
        };
    });
  };

  const commitHole = (moves: Move[]) => {
    setState(prev => {
      // Ensure currentHole is valid before incrementing
      const currentHoleNum = typeof prev.currentHole === 'number' ? prev.currentHole : 1;
      const nextHole = currentHoleNum + 1;
      
      const newOwnership = { ...prev.ownership };
      moves.forEach(move => {
        // Only assign if the player still exists (safety check)
        if (prev.players.some(p => p.id === move.toPlayerId)) {
             newOwnership[move.cardId] = move.toPlayerId;
        }
      });

      const historyEntry: HistoryEntry = {
        holeNumber: currentHoleNum,
        timestamp: new Date().toISOString(),
        moves,
        ownershipSnapshot: { ...prev.ownership }
      };

      return {
        ...prev,
        ownership: newOwnership,
        history: [...prev.history, historyEntry],
        currentHole: nextHole,
        status: nextHole > MAX_HOLES ? 'FINISHED' : 'PLAYING'
      };
    });
  };

  const undoLastHole = () => {
    setState(prev => {
      if (prev.history.length === 0) return prev;
      
      const lastEntry = prev.history[prev.history.length - 1];
      const newHistory = prev.history.slice(0, -1);
      
      return {
        ...prev,
        ownership: lastEntry.ownershipSnapshot,
        currentHole: lastEntry.holeNumber,
        history: newHistory,
        status: 'PLAYING'
      };
    });
  };

  const resetGame = () => {
    // Reset to fresh state (Title Screen)
    setState(getInitialState());
  };

  const rematch = () => {
    // Keep players, reset everything else (Hole 1)
    setState(prev => {
        const initialOwnership: CardOwnership = {};
        ALL_CARDS.forEach(c => initialOwnership[c.id] = null);

        return {
            ...getInitialState(),
            players: prev.players, // Keep existing players
            ownership: initialOwnership,
            status: 'PLAYING',
            currentHole: 1,
            history: []
        };
    });
  };

  const importState = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.players || !parsed.ownership || !parsed.status) {
        throw new Error("Invalid format");
      }
      setState(parsed);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return {
    state,
    addPlayer,
    removePlayer,
    startGame,
    commitHole,
    undoLastHole,
    resetGame,
    rematch,
    importState
  };
};