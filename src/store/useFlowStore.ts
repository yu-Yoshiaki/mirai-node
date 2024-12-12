import { create } from "zustand";
import { Node, Edge, ViewMode } from "../types";
import {
  generateSuggestions,
  createNode,
  calculateSuggestionPosition,
} from "../utils/suggestions";
import { useMandalaStore } from "./useMandalaStore";

const FIRST_NODE_ID = "first-node";
const STORAGE_KEY = "miraiNodeData";

const initialNode: Node = {
  id: FIRST_NODE_ID,
  type: "default",
  position: { x: 0, y: 0 },
  data: {
    label: "現在の自分",
    nodeType: "user",
  },
};

type StoredState = {
  nodes: Node[];
  edges: Edge[];
  viewMode: ViewMode;
};

const loadFromLocalStorage = (): StoredState | null => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return {
        nodes: parsedData.nodes || [],
        edges: parsedData.edges || [],
        viewMode: parsedData.viewMode || "neural",
      };
    }
  } catch (error) {
    console.error("Failed to parse localStorage data:", error);
  }
  return null;
};

const saveToLocalStorage = (state: StoredState) => {
  try {
    const dataToSave = JSON.stringify(state);
    console.log("Saving data to localStorage:", dataToSave);
    localStorage.setItem(STORAGE_KEY, dataToSave);
    console.log("Data saved successfully");
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
};

type FlowStoreState = {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  viewMode: ViewMode;
  initialized: boolean;
  setViewMode: (mode: ViewMode) => void;
  setSelectedNodeId: (id: string | null) => void;
  initializeFlow: () => void;
  addSuggestionFromNode: (sourceNodeId: string) => void;
  addNode: (label: string) => void;
};

export const useFlowStore = create<FlowStoreState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  viewMode: "neural",
  initialized: false,

  setViewMode: (mode: ViewMode) => {
    set({ viewMode: mode });
    saveToLocalStorage({
      nodes: get().nodes,
      edges: get().edges,
      viewMode: mode,
    });
  },

  setSelectedNodeId: (id: string | null) => {
    set({ selectedNodeId: id });
  },

  initializeFlow: () => {
    const currentState = get();
    if (currentState.initialized) {
      console.log("Already initialized, skipping...");
      return;
    }

    console.log("Initializing flow...");
    const savedData = loadFromLocalStorage();
    if (savedData) {
      console.log("Found saved data:", savedData);
      // 保存されているデータがある場合は、それを使用
      set({
        nodes: savedData.nodes,
        edges: savedData.edges,
        viewMode: savedData.viewMode,
        initialized: true,
      });
      saveToLocalStorage({
        nodes: savedData.nodes,
        edges: savedData.edges,
        viewMode: savedData.viewMode,
      });
    } else {
      console.log("No saved data found, using initial state");
      // 保存されているデータがない場合は、初期状態を設定
      const initialState = {
        nodes: [initialNode],
        edges: [],
        viewMode: "neural" as ViewMode,
      };
      set({ ...initialState, initialized: true });
      saveToLocalStorage(initialState);
    }
  },

  addSuggestionFromNode: (sourceNodeId: string) => {
    set((state) => {
      const sourceNode = state.nodes.find((node) => node.id === sourceNodeId);
      if (!sourceNode) return state;

      const timestamp = Date.now();
      const suggestions = generateSuggestions(sourceNode.data.label);

      const suggestionNodes: Node[] = [];
      const suggestionEdges: Edge[] = [];

      suggestions.forEach((suggestion, index) => {
        const suggestionNodeId = `suggestion-${timestamp}-${index}`;
        const position = calculateSuggestionPosition(
          sourceNode.position.x,
          sourceNode.position.y,
          index,
          suggestions.length,
          state.nodes,
          sourceNode
        );

        suggestionNodes.push(
          createNode(suggestionNodeId, suggestion, position, "suggestion")
        );

        suggestionEdges.push({
          id: `edge-${timestamp}-${index}`,
          source: sourceNodeId,
          target: suggestionNodeId,
        });
      });

      const newState = {
        ...state,
        nodes: [...state.nodes, ...suggestionNodes],
        edges: [...state.edges, ...suggestionEdges],
      };

      saveToLocalStorage({
        nodes: newState.nodes,
        edges: newState.edges,
        viewMode: newState.viewMode,
      });
      return newState;
    });
  },

  addNode: (label: string) => {
    const state = get();
    if (state.viewMode === "mandala") {
      useMandalaStore.getState().generateMandalaChart(label);
      return;
    }

    set((state) => {
      const timestamp = Date.now();
      const userNodeId = `node-${timestamp}`;
      const sourceNodeId = state.selectedNodeId || FIRST_NODE_ID;
      const sourceNode = state.nodes.find((node) => node.id === sourceNodeId);

      if (!sourceNode) return state;

      const position = calculateSuggestionPosition(
        sourceNode.position.x,
        sourceNode.position.y,
        0,
        1,
        state.nodes,
        sourceNode
      );

      const userNode = createNode(userNodeId, label, position, "user");

      const userEdge: Edge = {
        id: `edge-${timestamp}-user`,
        source: sourceNodeId,
        target: userNodeId,
      };

      const suggestions = generateSuggestions(label);
      const suggestionNodes: Node[] = [];
      const suggestionEdges: Edge[] = [];

      suggestions.forEach((suggestion, index) => {
        const suggestionNodeId = `suggestion-${timestamp}-${index}`;
        const suggestionPosition = calculateSuggestionPosition(
          userNode.position.x,
          userNode.position.y,
          index,
          suggestions.length,
          [...state.nodes, userNode],
          userNode
        );

        suggestionNodes.push(
          createNode(
            suggestionNodeId,
            suggestion,
            suggestionPosition,
            "suggestion"
          )
        );

        suggestionEdges.push({
          id: `edge-${timestamp}-${index}`,
          source: userNodeId,
          target: suggestionNodeId,
        });
      });

      const newState = {
        ...state,
        nodes: [...state.nodes, userNode, ...suggestionNodes],
        edges: [...state.edges, userEdge, ...suggestionEdges],
      };

      saveToLocalStorage({
        nodes: newState.nodes,
        edges: newState.edges,
        viewMode: newState.viewMode,
      });
      return newState;
    });
  },
}));
