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
  isLoading: boolean;
  setViewMode: (mode: ViewMode) => void;
  setSelectedNodeId: (id: string | null) => void;
  initializeFlow: () => void;
  addSuggestionFromNode: (sourceNodeId: string) => Promise<void>;
  addNode: (label: string) => Promise<void>;
};

export const useFlowStore = create<FlowStoreState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  viewMode: "neural",
  initialized: false,
  isLoading: false,

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
      const initialState = {
        nodes: [initialNode],
        edges: [],
        viewMode: "neural" as ViewMode,
      };
      set({ ...initialState, initialized: true });
      saveToLocalStorage(initialState);
    }
  },

  addSuggestionFromNode: async (sourceNodeId: string) => {
    set({ isLoading: true });
    try {
      const state = get();
      const sourceNode = state.nodes.find((node) => node.id === sourceNodeId);
      if (!sourceNode) {
        set({ isLoading: false });
        return;
      }

      const timestamp = Date.now();
      const suggestions = await generateSuggestions(sourceNode.data.label);

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
        nodes: [...state.nodes, ...suggestionNodes],
        edges: [...state.edges, ...suggestionEdges],
      };

      set({ ...newState, isLoading: false });
      saveToLocalStorage({
        nodes: newState.nodes,
        edges: newState.edges,
        viewMode: state.viewMode,
      });
    } catch (error) {
      console.error("Error generating suggestions:", error);
      set({ isLoading: false });
    }
  },

  addNode: async (label: string) => {
    const state = get();
    if (state.viewMode === "mandala") {
      useMandalaStore.getState().generateMandalaChart(label);
      return;
    }

    set({ isLoading: true });
    try {
      const timestamp = Date.now();
      const userNodeId = `node-${timestamp}`;
      const sourceNodeId = state.selectedNodeId || FIRST_NODE_ID;
      const sourceNode = state.nodes.find((node) => node.id === sourceNodeId);

      if (!sourceNode) {
        set({ isLoading: false });
        return;
      }

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

      const suggestions = await generateSuggestions(label);
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
        nodes: [...state.nodes, userNode, ...suggestionNodes],
        edges: [...state.edges, userEdge, ...suggestionEdges],
      };

      set({ ...newState, isLoading: false });
      saveToLocalStorage({
        nodes: newState.nodes,
        edges: newState.edges,
        viewMode: state.viewMode,
      });
    } catch (error) {
      console.error("Error adding node:", error);
      set({ isLoading: false });
    }
  },
}));
