import { MandalaNode, Position } from "../types";

type DummyElements = {
  [key: string]: string[];
};

// グリッドの位置を計算する関数
export const calculateGridPosition = (index: number): Position => {
  const row = Math.floor(index / 3);
  const col = index % 3;

  // 中央を(0,0)として、相対的な位置を計算
  return {
    x: col - 1, // -1, 0, 1
    y: row - 1, // -1, 0, 1
  };
};

// クリックされたマスの位置に基づいて新しいグリッドの位置を計算
export const calculateNewGridPosition = (
  clickedIndex: number,
  basePosition: Position = { x: 0, y: 0 }
): Position => {
  const { x: relX, y: relY } = calculateGridPosition(clickedIndex);
  const cellSize = 80; // 1マスのサイズ
  const gridSize = cellSize * 3; // 3x3グリッド全体のサイズ

  // クリックされたマスの方向にピッタリくっつけて配置
  return {
    x: basePosition.x + relX * gridSize,
    y: basePosition.y + relY * gridSize,
  };
};

// ダミーデータ生成用の関数
export const generateMandalaElements = (centerLabel: string): string[] => {
  const dummyElements: DummyElements = {
    英会話を上達させたい: [
      "発音練習",
      "語彙強化",
      "リスニング力向上",
      "スピーキング練習",
      "文法の基礎固め",
      "オンライン英会話",
      "海外ドラマ視聴",
      "英語ニュース購読",
    ],
    発音練習: [
      "シャドーイング",
      "発音記号学習",
      "音声アプリ活用",
      "ネイティブ音声模倣",
      "録音して確認",
      "リピーティング",
      "口の形の練習",
      "アクセント練習",
    ],
    語彙強化: [
      "単語カード作成",
      "例文暗記",
      "単語帳アプリ",
      "関連語学習",
      "熟語・イディオム",
      "分野別単語",
      "語源学習",
      "使用頻度確認",
    ],
  };

  return (
    dummyElements[centerLabel] || [
      "要素1",
      "要素2",
      "要素3",
      "要素4",
      "要素5",
      "要素6",
      "要素7",
      "要素8",
    ]
  );
};

export const generateMandalaNode = (
  label: string,
  parentId?: string,
  position: Position = { x: 0, y: 0 },
  isCenter: boolean = false
): MandalaNode => {
  const id = `mandala-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const elements = generateMandalaElements(label);

  return {
    id,
    label,
    parentId,
    position,
    isCenter,
    children: elements.map((element) => ({
      id: `mandala-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: element,
      parentId: id,
    })),
  };
};

// 指定された位置に既にグリッドが存在するかどうかを判定する関数
export const isPositionOccupied = (
  position: Position,
  nodes: MandalaNode[]
): boolean => {
  return nodes.some(
    (node) => node.position?.x === position.x && node.position?.y === position.y
  );
};
