import { create } from "zustand";
import { MandalaNode, Position } from "../types";
import { generateMandalaNode } from "../utils/mandala";

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
  generateMandalaChart: (
    label: string,
    parentId?: string,
    position?: Position
  ) => void;
  initializeMandala: () => void;
  addNode: (node: MandalaNode) => void;
  updateNode: (node: MandalaNode) => void;
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

  generateMandalaChart: (label: string, parentId?: string) => {
    set((state) => {
      const centerNode = generateMandalaNode(
        label,
        parentId,
        { x: 0, y: 0 },
        true
      );

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

      const surroundingNodes =
        centerNode.children
          ?.map((child, index) => {
            if (!child || index >= positions.length) return null;

            return generateMandalaNode(
              child.label,
              centerNode.id,
              positions[index],
              false
            );
          })
          .filter((node): node is MandalaNode => node !== null) || [];

      const newState = {
        mandalaNodes: [...state.mandalaNodes, centerNode, ...surroundingNodes],
        currentMandalaId: centerNode.id,
      };
      saveToLocalStorage(newState);
      return newState;
    });
  },

  addNode: (node) =>
    set((state) => ({
      mandalaNodes: [...state.mandalaNodes, node],
    })),

  updateNode: (updatedNode) =>
    set((state) => ({
      mandalaNodes: state.mandalaNodes.map((node) =>
        node.id === updatedNode.id ? updatedNode : node
      ),
    })),
}));
