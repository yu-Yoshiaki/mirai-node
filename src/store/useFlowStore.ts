import { create } from "zustand";
import { Node, Edge, FlowState, ViewMode, Position } from "../types";
import {
  generateSuggestions,
  createNode,
  calculateSuggestionPosition,
} from "../utils/suggestions";
import { generateMandalaNode } from "../utils/mandala";

const FIRST_NODE_ID = "first-node";
const STORAGE_KEY = "flow-data";

const initialNode: Node = {
  id: FIRST_NODE_ID,
  type: "default",
  position: { x: 0, y: 0 },
  data: {
    label: "現在の自分",
    nodeType: "user",
  },
};

// 初期モードをURLクエリパラメータから取得
const getInitialViewMode = (): ViewMode => {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode") as ViewMode;
  return mode === "neural" || mode === "mandala" ? mode : "neural";
};

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  viewMode: getInitialViewMode(),
  mandalaNodes: [],
  currentMandalaId: null,

  setViewMode: (mode: ViewMode) => {
    set({ viewMode: mode });
    if (mode === "mandala") {
      // マンダラチャートモードに切り替えた時、既存のノードをクリア
      set({ mandalaNodes: [] });
    }
  },

  setSelectedNodeId: (id: string | null) => {
    set({ selectedNodeId: id });
  },

  setCurrentMandalaId: (id: string | null) => {
    set({ currentMandalaId: id });
  },

  generateMandalaChart: (
    label: string,
    parentId?: string,
    position?: Position
  ) => {
    set((state) => {
      const newNode = generateMandalaNode(label, parentId, position);

      // 最初のノードの場合は中央に配置
      if (state.mandalaNodes.length === 0) {
        newNode.position = { x: 0, y: 0 };
        return {
          mandalaNodes: [newNode],
          currentMandalaId: newNode.id,
        };
      }

      // 既存のノードに新しいノードを追加
      const updatedNodes = [...state.mandalaNodes, newNode];

      return {
        mandalaNodes: updatedNodes,
        currentMandalaId: newNode.id,
      };
    });
  },

  initializeFlow: () => {
    localStorage.removeItem(STORAGE_KEY);

    const initialState = {
      nodes: [initialNode],
      edges: [],
      mandalaNodes: [],
      currentMandalaId: null,
    };

    set({ ...initialState, viewMode: getInitialViewMode() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
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
        nodes: [...state.nodes, ...suggestionNodes],
        edges: [...state.edges, ...suggestionEdges],
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
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
        nodes: [...state.nodes, userNode, ...suggestionNodes],
        edges: [...state.edges, userEdge, ...suggestionEdges],
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  },
}));
