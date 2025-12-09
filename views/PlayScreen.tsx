import React, { useState, useEffect } from 'react';
import { GameState, Move, Player } from '../types';
import { ALL_CARDS, PENALTY_CARDS, REWARD_CARDS } from '../constants';
import { CardBadge } from '../components/CardBadge';
import { ScoreCard } from '../components/ScoreCard';
import { ChevronRight, Undo2, Check, X } from 'lucide-react';

interface PlayScreenProps {
  state: GameState;
  onCommit: (moves: Move[]) => void;
  onUndo: () => void;
  onReset: () => void;
  onShowHistory: () => void;
}

export const PlayScreen: React.FC<PlayScreenProps> = ({ 
  state, 
  onCommit, 
  onUndo, 
  onShowHistory
}) => {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [moves, setMoves] = useState<Move[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCardIdForMove, setCurrentCardIdForMove] = useState<string | null>(null);

  // Reset local state when the hole changes
  useEffect(() => {
    setMoves([]);
    setSelectedCards([]);
    setIsModalOpen(false);
    setCurrentCardIdForMove(null);
  }, [state.currentHole]);

  // Sorting players by net score for scoreboard
  const sortedPlayers = [...state.players].sort((a, b) => {
    const getNet = (p: Player) => {
      const myCards = ALL_CARDS.filter(c => state.ownership[c.id] === p.id);
      const pen = myCards.filter(c => c.type === 'PENALTY').length;
      const rew = myCards.filter(c => c.type === 'REWARD').length;
      return Math.max(pen - rew, 0);
    };
    return getNet(a) - getNet(b);
  });

  const handleCardToggle = (cardId: string) => {
    // If card is already in pending moves, remove that move
    if (moves.some(m => m.cardId === cardId)) {
        setMoves(moves.filter(m => m.cardId !== cardId));
        setSelectedCards(selectedCards.filter(id => id !== cardId));
        return;
    }
    
    // Open modal to select owner
    setCurrentCardIdForMove(cardId);
    setIsModalOpen(true);
  };

  const handleAssignOwner = (playerId: string) => {
    if (!currentCardIdForMove) return;
    
    // Create new move
    const newMove: Move = {
        cardId: currentCardIdForMove,
        fromPlayerId: state.ownership[currentCardIdForMove],
        toPlayerId: playerId
    };

    setMoves(prev => [...prev, newMove]);
    setSelectedCards(prev => [...prev, currentCardIdForMove]);
    setIsModalOpen(false);
    setCurrentCardIdForMove(null);
  };

  const handleFinishHole = () => {
    onCommit(moves);
    // State reset is handled by useEffect above
  };

  return (
    <div className="pb-32 bg-gray-50 min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-sm border-b px-3 py-3 flex justify-between items-center">
         <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Current</span>
            <h2 className="text-xl font-black text-gray-800 leading-none">Hole {state.currentHole}</h2>
         </div>
         <div className="flex gap-2">
            <button 
                onClick={onUndo}
                disabled={state.currentHole === 1}
                className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                <Undo2 size={16} />
                <span className="text-xs font-bold">1ホール戻る</span>
            </button>
            <button 
                onClick={onShowHistory}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-bold border border-gray-200"
            >
                履歴
            </button>
         </div>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        {/* Scoreboard Area */}
        <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 mb-2 tracking-wider">LEADERBOARD</h3>
            {sortedPlayers.map((player, idx) => (
                <ScoreCard 
                    key={player.id} 
                    player={player} 
                    ownership={state.ownership} 
                    rank={idx + 1}
                />
            ))}
        </div>

        {/* Card Input Area */}
        <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                PENALTY CARDS (タップして移動)
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-6">
                {PENALTY_CARDS.map(card => {
                    const move = moves.find(m => m.cardId === card.id);
                    const isSelected = !!move;
                    return (
                        <div key={card.id} className="relative group">
                            <CardBadge 
                                cardId={card.id} 
                                size="md" 
                                selected={isSelected}
                                onClick={() => handleCardToggle(card.id)}
                                className="h-full w-full"
                            />
                            {isSelected && (
                                <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow-md z-10 border border-white animate-bounce-short">
                                    To: {state.players.find(p => p.id === move.toPlayerId)?.name}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <h3 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                REWARD CARDS (タップして移動)
            </h3>
            <div className="grid grid-cols-2 gap-2">
                {REWARD_CARDS.map(card => {
                    const move = moves.find(m => m.cardId === card.id);
                    const isSelected = !!move;
                    return (
                        <div key={card.id} className="relative">
                            <CardBadge 
                                cardId={card.id} 
                                size="md" 
                                selected={isSelected}
                                onClick={() => handleCardToggle(card.id)}
                                className="h-full w-full"
                            />
                             {isSelected && (
                                <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow-md z-10 border border-white animate-bounce-short">
                                    To: {state.players.find(p => p.id === move.toPlayerId)?.name}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 w-full bg-white border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 safe-area-bottom">
        <div className="max-w-lg mx-auto flex gap-3">
            <button 
                onClick={handleFinishHole}
                className={`flex-1 py-3.5 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                    moves.length === 0 
                    ? "bg-gray-100 text-gray-600 border border-gray-200"
                    : "bg-blue-600 text-white"
                }`}
            >
                {moves.length === 0 ? "移動なしで次へ" : `${moves.length}枚移動して次へ`}
                <ChevronRight size={20} />
            </button>
        </div>
      </div>

      {/* Player Selection Modal */}
      {isModalOpen && currentCardIdForMove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">誰のカードになりましたか？</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-4 flex flex-col items-center">
                    <CardBadge cardId={currentCardIdForMove} size="lg" className="mb-6 w-1/2 shadow-md" />
                    
                    <div className="grid grid-cols-1 w-full gap-2">
                        {state.players.map(p => (
                            <button
                                key={p.id}
                                onClick={() => handleAssignOwner(p.id)}
                                className="w-full py-3 px-4 bg-white border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 text-gray-800 font-bold rounded-xl transition-all flex justify-between items-center group"
                            >
                                <span>{p.name}</span>
                                <Check size={20} className="opacity-0 group-hover:opacity-100 text-blue-500" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};