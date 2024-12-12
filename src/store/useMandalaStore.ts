import { create } from "zustand";
import { MandalaNode } from "../types";
import { generateMandalaNode } from "../utils/mandala";
import { generateMandalaContent } from "../utils/mandalaOpenai";

const MANDALA_STORAGE_KEY = "miraiMandalaData";
const GRID_SIZE = 180; // 3 * 60 (CELL_SIZE)

type MandalaStoredState = {
  mandalaNodes: MandalaNode[];
  currentMandalaId: string | null;
};

const loadFromLocalStorage = (): MandalaStoredState | null => {
  try {
    const savedData = localStorage.getItem(MANDALA_STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return {
        mandalaNodes: parsedData.mandalaNodes || [],
        currentMandalaId: parsedData.currentMandalaId || null,
      };
    }
  } catch (error) {
    console.error("Failed to parse mandala localStorage data:", error);
  }
  return null;
};

const saveToLocalStorage = (state: MandalaStoredState) => {
  try {
    localStorage.setItem(MANDALA_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save mandala to localStorage:", error);
  }
};

type MandalaState = MandalaStoredState & {
  setCurrentMandalaId: (id: string | null) => void;
  generateMandalaChart: (label: string) => Promise<void>;
  initializeMandala: () => void;
  addNode: (node: MandalaNode) => void;
  updateNode: (node: MandalaNode) => void;
};

const positions = [
  { x: -GRID_SIZE, y: -GRID_SIZE }, // 左上
  { x: 0, y: -GRID_SIZE }, // 上
  { x: GRID_SIZE, y: -GRID_SIZE }, // 右上
  { x: -GRID_SIZE, y: 0 }, // 左
  { x: GRID_SIZE, y: 0 }, // 右
  { x: -GRID_SIZE, y: GRID_SIZE }, // 左下
  { x: 0, y: GRID_SIZE }, // 下
  { x: GRID_SIZE, y: GRID_SIZE }, // 右下
];

const calculateSubPosition = (
  basePosition: { x: number; y: number },
  index: number
) => {
  const subGridSize = GRID_SIZE / 3;
  const row = Math.floor(index / 3);
  const col = index % 3;
  return {
    x: basePosition.x + (col - 1) * subGridSize,
    y: basePosition.y + (row - 1) * subGridSize,
  };
};

export const useMandalaStore = create<MandalaState>((set) => ({
  mandalaNodes: [],
  currentMandalaId: null,

  initializeMandala: () => {
    const savedData = loadFromLocalStorage();
    if (savedData) {
      set({
        mandalaNodes: savedData.mandalaNodes,
        currentMandalaId: savedData.currentMandalaId,
      });
    }
  },

  setCurrentMandalaId: (id: string | null) => {
    set((state) => {
      const newState = { ...state, currentMandalaId: id };
      saveToLocalStorage(newState);
      return newState;
    });
  },

  generateMandalaChart: async (label: string) => {
    try {
      // 中心ノードを生成
      const centerNode = generateMandalaNode(
        label,
        undefined,
        { x: 0, y: 0 },
        true
      );
      console.log("中心ノードを生成:", centerNode.label);

      // 第1階層の8要素を生成
      const firstLevelElements = await generateMandalaContent(label);
      console.log("第1階層の要素を生成:", firstLevelElements);

      // 第1階層のノードを生成
      const firstLevelNodes = firstLevelElements.map(
        (element: string, index: number) =>
          generateMandalaNode(element, centerNode.id, positions[index], false)
      );
      console.log(
        "第1階層のノードを生成:",
        firstLevelNodes.map((node: MandalaNode) => node.label)
      );

      // 第2階層の要素を並列生成
      const secondLevelPromises = firstLevelElements.map(
        async (topic: string) => {
          console.log("第2階層を生成中:", topic);
          return generateMandalaContent(topic);
        }
      );

      const secondLevelResults = await Promise.all(secondLevelPromises);
      console.log("第2階層の生成完了");

      // 第2階層のノードを生成
      const secondLevelNodes = firstLevelNodes.flatMap(
        (firstLevelNode: MandalaNode, firstIndex: number) => {
          const subElements = secondLevelResults[firstIndex];
          console.log(`${firstLevelNode.label}の子ノードを生成:`, subElements);

          return subElements.map((element: string, secondIndex: number) => {
            const subPosition = calculateSubPosition(
              positions[firstIndex],
              secondIndex
            );
            return generateMandalaNode(
              element,
              firstLevelNode.id,
              subPosition,
              false
            );
          });
        }
      );

      console.log(
        "生成完了 - 合計ノード数:",
        1 + firstLevelNodes.length + secondLevelNodes.length
      );

      // 全ノードを保存
      set((state) => {
        const newNodes = [centerNode, ...firstLevelNodes, ...secondLevelNodes];

        const newState = {
          mandalaNodes: [...state.mandalaNodes, ...newNodes],
          currentMandalaId: centerNode.id,
        };
        saveToLocalStorage(newState);
        return newState;
      });
    } catch (error) {
      console.error("マンダラチャートの生成に失敗:", error);
    }
  },

  addNode: (node: MandalaNode) =>
    set((state) => ({
      mandalaNodes: [...state.mandalaNodes, node],
    })),

  updateNode: (updatedNode: MandalaNode) =>
    set((state) => ({
      mandalaNodes: state.mandalaNodes.map((node) =>
        node.id === updatedNode.id ? updatedNode : node
      ),
    })),
}));
