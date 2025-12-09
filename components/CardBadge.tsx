import React from 'react';
import { CardDef } from '../types';
import { ALL_CARDS } from '../constants';

interface CardBadgeProps {
  cardId: string;
  size?: 'sm' | 'md' | 'lg';
  showType?: boolean;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export const CardBadge: React.FC<CardBadgeProps> = ({ 
  cardId, 
  size = 'md', 
  showType = false,
  className = '',
  onClick,
  selected = false
}) => {
  const card = ALL_CARDS.find(c => c.id === cardId);
  
  if (!card) return null;

  const isPenalty = card.type === 'PENALTY';
  
  const baseClasses = "rounded-lg font-bold flex items-center justify-center transition-all shadow-sm border select-none";
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-2",
    lg: "text-base px-4 py-3"
  };

  const colorClasses = isPenalty
    ? (selected 
        ? "bg-red-600 text-white border-red-700 shadow-md ring-2 ring-offset-1 ring-red-500" 
        : "bg-white text-red-700 border-red-200 hover:bg-red-50")
    : (selected 
        ? "bg-green-600 text-white border-green-700 shadow-md ring-2 ring-offset-1 ring-green-500" 
        : "bg-white text-green-700 border-green-200 hover:bg-green-50");

  return (
    <div 
      className={`${baseClasses} ${sizeClasses[size]} ${colorClasses} ${className} ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
      onClick={onClick}
    >
      <span className="truncate">{card.name}</span>
    </div>
  );
};