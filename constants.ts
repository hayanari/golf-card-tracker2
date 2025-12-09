import { CardDef } from './types';

export const PENALTY_CARDS: CardDef[] = [
  { id: 'p_pond', name: '池', type: 'PENALTY', description: 'レッドゾーン含む' },
  { id: 'p_bunker', name: '砂', type: 'PENALTY', description: 'バンカー' },
  { id: 'p_btob', name: 'BtoB', type: 'PENALTY', description: 'バンカーからバンカー' },
  { id: 'p_duff', name: 'ダフリ', type: 'PENALTY' },
  { id: 'p_collar', name: 'カラー', type: 'PENALTY' },
  { id: 'p_ob', name: 'OB', type: 'PENALTY' },
  { id: 'p_lumberjack', name: '木こり', type: 'PENALTY', description: '木に当てる' },
  { id: 'p_under_tree', name: '木の下', type: 'PENALTY' },
  { id: 'p_3putt', name: '3パット', type: 'PENALTY' },
  { id: 'p_4putt', name: '4パット', type: 'PENALTY' },
  { id: 'p_repair', name: '修理地', type: 'PENALTY' },
  { id: 'p_edge', name: 'ふちこ', type: 'PENALTY', description: 'カップの縁' },
  { id: 'p_lick', name: 'なめこ', type: 'PENALTY', description: 'カップを舐める' },
  { id: 'p_next_hole', name: '隣のホール', type: 'PENALTY' },
];

export const REWARD_CARDS: CardDef[] = [
  { id: 'r_1putt', name: '1パット', type: 'REWARD' },
  { id: 'r_only_one', name: 'オンリーワン', type: 'REWARD', description: 'ショートで一人だけON' },
  { id: 'r_going_my_way', name: 'ゴーイングマイウェイ', type: 'REWARD', description: '一人だけFW' },
  { id: 'r_chip_in', name: 'チップイン', type: 'REWARD' },
];

export const ALL_CARDS = [...PENALTY_CARDS, ...REWARD_CARDS];

export const STORAGE_KEY = 'golf_card_game_v1';
export const MAX_HOLES = 18;