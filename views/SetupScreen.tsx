import React, { useState } from 'react';
import { Player, CardOwnership } from '../types';
import { ALL_CARDS } from '../constants';
import { Plus, Trash2, Play, UserCheck, AlertCircle } from 'lucide-react';
import { CardBadge } from '../components/CardBadge';

interface SetupScreenProps {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
  onStart: (distribution: 'NONE' | 'RANDOM' | 'MANUAL', manualAssignments?: CardOwnership) => void;
  onImport: (json: string) => boolean;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ 
  players, 
  onAddPlayer, 
  onRemovePlayer, 
  onStart,
  onImport
}) => {
  const [newName, setNewName] = useState('');
  const [mode, setMode] = useState<'INITIAL' | 'MANUAL_DIST'>('INITIAL');
  const [manualOwnership, setManualOwnership] = useState<CardOwnership>({});
  
  // File import ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newName.trim()) return;
    if (players.some(p => p.name === newName.trim())) {
        alert("名前が重複しています");
        return;
    }
    onAddPlayer(newName.trim());
    setNewName('');
  };

  const handleStart = (distribution: 'NONE') => {
    // If user typed a name but didn't click add, add it automatically
    if (newName.trim()) {
       if (players.length < 4 && !players.some(p => p.name === newName.trim())) {
           onAddPlayer(newName.trim());
           // Small delay to ensure state update processes before start
           setTimeout(() => onStart(distribution), 50);
           return;
       }
    }
    onStart(distribution);
  };

  const handleManualAssignmentChange = (cardId: string, playerId: string) => {
    setManualOwnership(prev => ({
        ...prev,
        [cardId]: playerId
    }));
  };

  const startManualSetup = () => {
    // Also handle implicit add for manual setup
    if (newName.trim() && players.length < 4 && !players.some(p => p.name === newName.trim())) {
        onAddPlayer(newName.trim());
        setNewName('');
        // We need to wait for the player to be added effectively, but for simplicity in manual mode
        // we'll just add it and let the user click again, or rely on React batching.
        // Better UX: just add it.
    }

    if (players.length < 2 && !newName.trim()) return;
    
    const initial: CardOwnership = {};
    ALL_CARDS.forEach(c => initial[c.id] = null);
    setManualOwnership(initial);
    setMode('MANUAL_DIST');
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
        if (evt.target?.result) {
            const success = onImport(evt.target.result as string);
            if (success) alert("復元しました");
            else alert("ファイルの形式が不正です");
        }
    };
    reader.readAsText(file);
  };

  if (mode === 'MANUAL_DIST') {
    return (
        <div className="pb-24 p-4 max-w-lg mx-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <UserCheck size={24} />
                初期カード所有者の設定
            </h2>
            <p className="text-sm text-gray-500 mb-6">各カードの持ち主を選択してください。</p>
            
            <div className="space-y-4">
                {ALL_CARDS.map(card => (
                    <div key={card.id} className="flex items-center justify-between bg-white p-3 rounded-lg border shadow-sm">
                        <CardBadge cardId={card.id} size="md" />
                        <select 
                            className="ml-4 p-2 bg-gray-50 border rounded-md text-sm w-36"
                            value={manualOwnership[card.id] || ""}
                            onChange={(e) => handleManualAssignmentChange(card.id, e.target.value)}
                        >
                            <option value="">(なし)</option>
                            {players.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex gap-3 safe-area-bottom">
                <button 
                    onClick={() => setMode('INITIAL')}
                    className="flex-1 py-3 px-4 bg-gray-200 rounded-lg font-bold text-gray-700"
                >
                    戻る
                </button>
                <button 
                    onClick={() => onStart('MANUAL', manualOwnership)}
                    className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-bold shadow-lg"
                >
                    ゲーム開始
                </button>
            </div>
        </div>
    );
  }

  // Determine if start is enabled (either >1 player added, or 1 player added + 1 in input)
  const canStart = players.length >= 2 || (players.length === 1 && newName.trim().length > 0);

  return (
    <div className="flex flex-col min-h-screen p-6 max-w-lg mx-auto pb-20">
      <div className="flex-1">
        <h1 className="text-2xl font-black text-gray-800 mb-2">Golf Card Tracker</h1>
        <p className="text-gray-500 mb-8 text-sm">プレイヤーを登録してゲームを開始します。</p>

        <div className="mb-8">
            <h3 className="font-bold text-gray-700 mb-3">プレイヤー ({players.length}/4)</h3>
            
            {players.length > 0 && (
                <ul className="space-y-3 mb-4">
                {players.map((player) => (
                    <li key={player.id} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border animate-fade-in">
                        <span className="font-medium text-lg">{player.name}</span>
                        <button 
                            onClick={() => onRemovePlayer(player.id)}
                            className="text-gray-400 hover:text-red-500 p-2"
                        >
                            <Trash2 size={20} />
                        </button>
                    </li>
                ))}
                </ul>
            )}

            {players.length < 4 && (
                <form onSubmit={handleAdd} className="flex gap-2">
                    <input 
                        type="text" 
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="名前を入力..."
                        className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    />
                    <button 
                        type="submit" 
                        disabled={!newName.trim()}
                        className="bg-gray-900 text-white p-3 rounded-lg disabled:opacity-50 shadow-md"
                    >
                        <Plus size={24} />
                    </button>
                </form>
            )}
        </div>
      </div>

      <div className="space-y-4">
        {!canStart && (
             <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md flex gap-2 items-center text-sm">
                <AlertCircle size={16}/>
                <span>2名以上登録してください</span>
             </div>
        )}

        <button 
            onClick={() => handleStart('NONE')}
            disabled={!canStart}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:shadow-none transition-all active:scale-[0.98]"
        >
            <Play size={20} />
            ゲーム開始
            <span className="text-sm font-normal text-blue-100">(カードなし)</span>
        </button>

        <button 
            onClick={startManualSetup}
            disabled={!canStart}
            className="w-full py-3 bg-white text-gray-600 border border-gray-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-gray-50 active:bg-gray-50"
        >
            <UserCheck size={18} />
            手動で初期配置を設定
        </button>
        
        <div className="pt-8 border-t mt-8">
             <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-gray-400 underline w-full text-center p-2"
             >
                保存データを読み込む (Import JSON)
             </button>
        </div>
      </div>
    </div>
  );
};