import { create } from "zustand";
import {
  Node,
  Edge,
  FlowState,
  ViewMode,
  Position,
  MandalaNode,
} from "../types";
import {
  generateSuggestions,
  createNode,
  calculateSuggestionPosition,
} from "../utils/suggestions";
import { generateMandalaNode, isPositionOccupied } from "../utils/mandala";

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
  mandalaNodes: MandalaNode[];
  currentMandalaId: string | null;
  viewMode: ViewMode;
};

const loadFromLocalStorage = (): StoredState | null => {
  try {
    console.log("Attempting to load data from localStorage...");
    const savedData = localStorage.getItem(STORAGE_KEY);
    console.log("Raw data from localStorage:", savedData);

    if (savedData) {
      const parsedData = JSON.parse(savedData);
      console.log("Parsed data:", parsedData);

      const result = {
        nodes: parsedData.nodes || [],
        edges: parsedData.edges || [],
        mandalaNodes: parsedData.mandalaNodes || [],
        currentMandalaId: parsedData.currentMandalaId || null,
        viewMode: parsedData.viewMode || "neural",
      };

      console.log("Processed data:", result);
      return result;
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

type ExtendedFlowState = FlowState & {
  initialized: boolean;
};

export const useFlowStore = create<ExtendedFlowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  viewMode: "neural" as ViewMode,
  mandalaNodes: [],
  currentMandalaId: null,
  initialized: false,

  setViewMode: (mode: ViewMode) => {
    const currentState = get();
    const savedData = loadFromLocalStorage();

    // 新しい状態を作成
    let newState = { ...currentState, viewMode: mode };

    if (savedData) {
      // マンダラモードに切り替わる時
      if (
        mode === "mandala" &&
        savedData.mandalaNodes.length > 0 &&
        currentState.mandalaNodes.length === 0
      ) {
        console.log("Restoring mandala data from localStorage");
        newState = {
          ...newState,
          mandalaNodes: savedData.mandalaNodes,
          currentMandalaId: savedData.currentMandalaId ?? null,
        };
      }
      // ニューラルモードに切り替わる時
      else if (
        mode === "neural" &&
        savedData.nodes.length > 0 &&
        currentState.nodes.length === 0
      ) {
        console.log("Restoring neural data from localStorage");
        newState = {
          ...newState,
          nodes: savedData.nodes,
          edges: savedData.edges ?? [],
        };
      }
    }

    console.log("Setting new state:", newState);
    set(newState);
    saveToLocalStorage({
      nodes: newState.nodes,
      edges: newState.edges,
      mandalaNodes: newState.mandalaNodes,
      currentMandalaId: newState.currentMandalaId,
      viewMode: newState.viewMode,
    });
  },

  setSelectedNodeId: (id: string | null) => {
    set({ selectedNodeId: id });
  },

  setCurrentMandalaId: (id: string | null) => {
    const newState = { ...get(), currentMandalaId: id };
    set(newState);
    saveToLocalStorage({
      nodes: newState.nodes,
      edges: newState.edges,
      mandalaNodes: newState.mandalaNodes,
      currentMandalaId: newState.currentMandalaId,
      viewMode: newState.viewMode,
    });
  },

  generateMandalaChart: (
    label: string,
    parentId?: string,
    position?: Position
  ) => {
    set((state) => {
      if (state.mandalaNodes.length === 0) {
        const newNode = generateMandalaNode(
          label,
          parentId,
          { x: 0, y: 0 },
          true
        );
        const newState = {
          ...state,
          mandalaNodes: [newNode],
          currentMandalaId: newNode.id,
        };
        saveToLocalStorage({
          nodes: newState.nodes,
          edges: newState.edges,
          mandalaNodes: newState.mandalaNodes,
          currentMandalaId: newState.currentMandalaId,
          viewMode: newState.viewMode,
        });
        return newState;
      }

      const parentNode = state.mandalaNodes.find(
        (node) => node.id === parentId
      );
      if (!parentNode || !parentNode.isCenter) return state;

      if (position && isPositionOccupied(position, state.mandalaNodes)) {
        console.warn("Position is already occupied");
        return state;
      }

      const newNode = generateMandalaNode(
        label,
        parentId,
        position || { x: 0, y: 0 },
        false
      );

      const newState = {
        ...state,
        mandalaNodes: [...state.mandalaNodes, newNode],
        currentMandalaId: newNode.id,
      };
      saveToLocalStorage({
        nodes: newState.nodes,
        edges: newState.edges,
        mandalaNodes: newState.mandalaNodes,
        currentMandalaId: newState.currentMandalaId,
        viewMode: newState.viewMode,
      });
      return newState;
    });
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
        mandalaNodes: savedData.mandalaNodes,
        currentMandalaId: savedData.currentMandalaId,
        viewMode: savedData.viewMode,
        initialized: true,
      });
      saveToLocalStorage(savedData);
    } else {
      console.log("No saved data found, using initial state");
      // 保存されているデータがない場合は、初期状態を設定
      const initialState = {
        nodes: [initialNode],
        edges: [],
        mandalaNodes: [],
        currentMandalaId: null,
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
        mandalaNodes: newState.mandalaNodes,
        currentMandalaId: newState.currentMandalaId,
        viewMode: newState.viewMode,
      });
      return newState;
    });
  },

  addNode: (label: string) => {
    const state = get();
    if (state.viewMode === "mandala") {
      state.generateMandalaChart(label);
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
        mandalaNodes: newState.mandalaNodes,
        currentMandalaId: newState.currentMandalaId,
        viewMode: newState.viewMode,
      });
      return newState;
    });
  },
}));
