import React from 'react';
import { GameState } from '../types';
import { ALL_CARDS } from '../constants';
import { ArrowLeft, ArrowRight, Undo2 } from 'lucide-react';
import { CardBadge } from '../components/CardBadge';

interface HistoryViewProps {
  state: GameState;
  onClose: () => void;
  onUndo: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ state, onClose, onUndo }) => {
  const handleUndo = () => {
    if (confirm('直前のホール（Hole ' + (state.currentHole - 1) + '）を取り消して戻りますか？')) {
        onUndo();
        onClose(); // Close history and go back to play screen
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <ArrowLeft size={24} />
            </button>
            <h2 className="font-bold text-lg">履歴</h2>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {state.history.length > 0 && (
            <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
                <h3 className="font-bold text-sm text-gray-500 mb-2">修正</h3>
                <button 
                    onClick={handleUndo}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold flex items-center justify-center gap-2"
                >
                    <Undo2 size={18} />
                    直前のホール(Hole {state.currentHole - 1})を取り消す
                </button>
            </div>
        )}

        {state.history.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">履歴はまだありません</div>
        ) : (
            [...state.history].reverse().map((entry) => (
                <div key={entry.holeNumber} className="bg-white rounded-xl shadow-sm border p-4">
                    <div className="flex justify-between items-baseline mb-3 border-b pb-2">
                        <span className="font-black text-xl text-gray-800">Hole {entry.holeNumber}</span>
                        <span className="text-xs text-gray-400">
                            {new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                    
                    {entry.moves.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-2">カード移動なし</p>
                    ) : (
                        <div className="space-y-3">
                            {entry.moves.map((move, i) => {
                                const fromName = move.fromPlayerId 
                                    ? state.players.find(p => p.id === move.fromPlayerId)?.name 
                                    : "(なし)";
                                const toName = state.players.find(p => p.id === move.toPlayerId)?.name;
                                
                                return (
                                    <div key={i} className="flex items-center justify-between gap-2 text-sm">
                                        <CardBadge cardId={move.cardId} size="sm" className="w-24 shrink-0" />
                                        <div className="flex-1 flex items-center justify-center gap-2 text-gray-600">
                                            <span className="truncate max-w-[80px] text-right">{fromName}</span>
                                            <ArrowRight size={14} className="text-gray-300" />
                                            <span className="truncate max-w-[80px] font-bold text-gray-900">{toName}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))
        )}
      </div>
    </div>
  );
};