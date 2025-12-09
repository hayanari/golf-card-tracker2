import React from 'react';
import { Player, CardOwnership } from '../types';
import { ALL_CARDS } from '../constants';
import { CardBadge } from './CardBadge';
import { User } from 'lucide-react';

interface ScoreCardProps {
  player: Player;
  ownership: CardOwnership;
  rank?: number;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ player, ownership, rank }) => {
  // Calculate scores
  const myCards = ALL_CARDS.filter(c => ownership[c.id] === player.id);
  const penaltyCount = myCards.filter(c => c.type === 'PENALTY').length;
  const rewardCount = myCards.filter(c => c.type === 'REWARD').length;
  const netScore = Math.max(penaltyCount - rewardCount, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-3">
      <div className="p-3 flex items-center justify-between bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
            {rank && (
                <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${rank === 1 ? 'bg-yellow-400 text-yellow-900' : 
                      rank === 2 ? 'bg-gray-300 text-gray-800' : 
                      rank === 3 ? 'bg-orange-300 text-orange-900' : 'bg-gray-200 text-gray-600'}
                `}>
                    {rank}
                </div>
            )}
            <div className="flex items-center gap-1.5">
                <User size={16} className="text-gray-400" />
                <span className="font-bold text-gray-800 truncate max-w-[120px]">{player.name}</span>
            </div>
        </div>
        <div className="flex items-baseline gap-3 text-sm">
          <div className="flex flex-col items-end leading-none">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Penalty</span>
            <span className="text-red-600 font-bold">{penaltyCount}</span>
          </div>
          <div className="flex flex-col items-end leading-none">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Reward</span>
            <span className="text-green-600 font-bold">{rewardCount}</span>
          </div>
          <div className="flex flex-col items-end leading-none pl-2 border-l border-gray-200">
             <span className="text-[10px] text-gray-500 uppercase tracking-wider">Net</span>
             <span className="text-xl font-black text-blue-900">{netScore}</span>
          </div>
        </div>
      </div>
      
      {/* Held Cards */}
      <div className="p-2 bg-white min-h-[50px]">
        {myCards.length === 0 ? (
          <p className="text-xs text-center text-gray-400 py-2">カードなし</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {myCards.map(card => (
              <CardBadge key={card.id} cardId={card.id} size="sm" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};