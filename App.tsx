import React, { useState } from 'react';
import { useGame } from './hooks/useGame';
import { SetupScreen } from './views/SetupScreen';
import { PlayScreen } from './views/PlayScreen';
import { ResultView } from './views/ResultView';
import { HistoryView } from './views/HistoryView';
import { Settings } from 'lucide-react';

export default function App() {
  const { 
    state, 
    addPlayer, 
    removePlayer, 
    startGame, 
    commitHole, 
    undoLastHole, 
    resetGame,
    rematch,
    importState
  } = useGame();

  const [viewMode, setViewMode] = useState<'GAME' | 'HISTORY'>('GAME');

  // Export current state
  const handleExport = () => {
    const dataStr = JSON.stringify(state);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `golf-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (state.status === 'SETUP') {
    return (
      <SetupScreen 
        players={state.players}
        onAddPlayer={addPlayer}
        onRemovePlayer={removePlayer}
        onStart={startGame}
        onImport={importState}
      />
    );
  }

  if (state.status === 'FINISHED') {
    return (
        <ResultView 
            state={state} 
            onReset={resetGame} 
            onRematch={rematch} 
            onUndo={undoLastHole}
        />
    );
  }

  if (viewMode === 'HISTORY') {
    return (
        <HistoryView 
            state={state} 
            onClose={() => setViewMode('GAME')} 
            onUndo={undoLastHole}
        />
    );
  }

  return (
    <>
        <PlayScreen 
            state={state} 
            onCommit={commitHole}
            onUndo={undoLastHole}
            onReset={resetGame}
            onShowHistory={() => setViewMode('HISTORY')}
        />
        
        {/* Simple footer for reset/export during play */}
        <div className="fixed top-3 right-3 z-50">
             <div className="group relative">
                <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full border border-transparent hover:border-gray-200">
                    <Settings size={20} />
                </button>
                <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden">
                    <button onClick={handleExport} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 text-gray-700">
                        データを保存 (JSON)
                    </button>
                    <button onClick={() => { if(window.confirm('リセットしますか？')) resetGame(); }} className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 text-red-600 border-t">
                        ゲームをリセット
                    </button>
                </div>
             </div>
        </div>
    </>
  );
}