import React, { useState } from 'react';
import { GameState, Player } from '../types';
import { ALL_CARDS, MAX_HOLES } from '../constants';
import { Trophy, Download, RotateCcw, Home, ImageIcon, Undo2 } from 'lucide-react';
import { ScoreCard } from '../components/ScoreCard';

interface ResultViewProps {
  state: GameState;
  onReset: () => void;
  onRematch: () => void;
  onUndo: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ state, onReset, onRematch, onUndo }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const sortedPlayers = [...state.players].sort((a, b) => {
    const getNet = (p: Player) => {
      const myCards = ALL_CARDS.filter(c => state.ownership[c.id] === p.id);
      const pen = myCards.filter(c => c.type === 'PENALTY').length;
      const rew = myCards.filter(c => c.type === 'REWARD').length;
      return Math.max(pen - rew, 0);
    };
    return getNet(a) - getNet(b);
  });

  const winner = sortedPlayers[0];

  const handleExportJson = () => {
    const dataStr = JSON.stringify(state);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `golf-result-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    try {
        await generateScoreCardImage(state);
    } catch (e) {
        console.error(e);
        alert("画像の生成に失敗しました");
    }
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pb-32">
       <div className="flex justify-start mb-4">
           <button 
                onClick={onUndo} 
                className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-2 rounded-lg bg-gray-800 border border-gray-700"
            >
               <Undo2 size={18} />
               <span>1ホール戻る (修正)</span>
           </button>
       </div>

      <div className="max-w-lg mx-auto text-center">
        <Trophy size={64} className="mx-auto text-yellow-400 mb-4 animate-bounce" />
        <h1 className="text-3xl font-black mb-2">GAME OVER</h1>
        <p className="text-gray-400 mb-8">全ホール終了</p>

        <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700 shadow-2xl">
            <span className="text-sm text-gray-400 uppercase tracking-widest">WINNER</span>
            <div className="text-4xl font-black mt-2 text-yellow-400">{winner.name}</div>
        </div>

        <div className="text-left space-y-4 mb-10">
            {sortedPlayers.map((player, idx) => (
                <ScoreCard key={player.id} player={player} ownership={state.ownership} rank={idx + 1} />
            ))}
        </div>

        <div className="flex flex-col gap-3">
             <button 
                onClick={handleGenerateImage}
                disabled={isGenerating}
                className="w-full py-4 bg-green-600 hover:bg-green-500 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg text-lg text-white"
            >
                <ImageIcon size={22} />
                {isGenerating ? "生成中..." : "結果を画像で保存 (カメラロールへ)"}
            </button>

            <button 
                onClick={onRematch}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
            >
                <RotateCcw size={20} />
                同じメンバーで再戦
            </button>
            
            <div className="flex gap-3 mt-2">
                <button 
                    onClick={handleExportJson}
                    className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 border border-gray-700 text-sm"
                >
                    <Download size={18} />
                    JSON保存
                </button>
                <button 
                    onClick={onReset}
                    className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold flex items-center justify-center gap-2 border border-gray-600 text-sm text-gray-200"
                >
                    <Home size={18} />
                    タイトルへ
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Canvas Generation Logic ---

const generateScoreCardImage = (state: GameState): Promise<void> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Colors
        const PLAYER_COLORS = ['#dbeafe', '#fce7f3', '#fef3c7', '#dcfce7']; // blue, pink, yellow, green (pastels)
        const PLAYER_TEXT_COLORS = ['#1e40af', '#9d174d', '#92400e', '#166534'];
        
        // Dimensions
        const CELL_W = 50;
        const NAME_COL_W = 160;
        const HEADER_H = 120;
        const ROW_H = 40;
        const TOTAL_W = NAME_COL_W + (MAX_HOLES * CELL_W) + 100; // + padding
        const TOTAL_H = HEADER_H + (ALL_CARDS.length * ROW_H) + 100; // + footer

        canvas.width = TOTAL_W;
        canvas.height = TOTAL_H;

        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, TOTAL_W, TOTAL_H);

        // Header Text
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText('Golf Card Game Result', 40, 50);
        
        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.fillText(new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(), 40, 85);

        // Player Legend
        let legendX = 400;
        state.players.forEach((p, i) => {
            const color = PLAYER_COLORS[i % PLAYER_COLORS.length];
            const textColor = PLAYER_TEXT_COLORS[i % PLAYER_TEXT_COLORS.length];
            
            ctx.fillStyle = color;
            ctx.fillRect(legendX, 30, 120, 40);
            
            ctx.fillStyle = textColor;
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(p.name, legendX + 60, 56);
            
            legendX += 140;
        });

        // Grid Header (Hole Numbers)
        ctx.textAlign = 'center';
        ctx.font = 'bold 14px sans-serif';
        for (let h = 1; h <= MAX_HOLES; h++) {
            const x = NAME_COL_W + (h - 1) * CELL_W + (CELL_W / 2);
            ctx.fillStyle = '#374151';
            ctx.fillText(h.toString(), x, HEADER_H - 10);
        }

        // Draw Rows
        ctx.textAlign = 'left';
        ctx.lineWidth = 1;

        ALL_CARDS.forEach((card, rIndex) => {
            const y = HEADER_H + rIndex * ROW_H;
            
            // Row Background (Alternating slightly)
            if (rIndex % 2 === 0) {
                ctx.fillStyle = '#f9fafb';
                ctx.fillRect(0, y, TOTAL_W, ROW_H);
            }

            // Card Name
            ctx.fillStyle = card.type === 'PENALTY' ? '#ef4444' : '#16a34a';
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText(card.name, 20, y + 26);
            
            // Horizontal Line
            ctx.strokeStyle = '#e5e7eb';
            ctx.beginPath();
            ctx.moveTo(0, y + ROW_H);
            ctx.lineTo(TOTAL_W, y + ROW_H);
            ctx.stroke();

            // Cells (History)
            for (let h = 1; h <= MAX_HOLES; h++) {
                const x = NAME_COL_W + (h - 1) * CELL_W;
                
                // Find ownership at this hole
                // history[0] is hole 1 result. history[h-1] is hole h result.
                let ownerId: string | null = null;
                
                // Check if we have history for this hole
                if (h <= state.history.length) {
                    const entry = state.history[h-1];
                    ownerId = entry.ownershipSnapshot[card.id];
                }

                if (ownerId) {
                    const pIndex = state.players.findIndex(p => p.id === ownerId);
                    if (pIndex >= 0) {
                        const color = PLAYER_COLORS[pIndex % PLAYER_COLORS.length];
                        const textColor = PLAYER_TEXT_COLORS[pIndex % PLAYER_TEXT_COLORS.length];
                        
                        // Fill cell
                        ctx.fillStyle = color;
                        ctx.fillRect(x + 2, y + 2, CELL_W - 4, ROW_H - 4);
                        
                        // Initial
                        ctx.fillStyle = textColor;
                        ctx.font = 'bold 14px sans-serif';
                        ctx.textAlign = 'center';
                        const initial = state.players[pIndex].name.substring(0, 1);
                        ctx.fillText(initial, x + (CELL_W/2), y + 25);
                    }
                }
            }
            
            ctx.textAlign = 'left'; // Reset
        });

        // Vertical Divider
        ctx.beginPath();
        ctx.moveTo(NAME_COL_W, HEADER_H - 30);
        ctx.lineTo(NAME_COL_W, TOTAL_H - 50);
        ctx.stroke();

        // Download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `golf-scorecard-${new Date().toISOString().slice(0,10)}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        resolve();
    });
};
