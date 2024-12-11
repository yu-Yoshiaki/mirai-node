import { SimulationNodeDatum } from "d3";

export interface Node extends SimulationNodeDatum {
  id: string;
  type: "default";
  position: { x: number; y: number };
  data: {
    label: string;
    nodeType: "user" | "suggestion";
  };
  // d3.js simulation properties
  fx?: number | null;
  fy?: number | null;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  index?: number;
}

export interface Edge {
  id: string;
  source: string | Node;
  target: string | Node;
}

export interface SimulationEdge extends Edge {
  source: Node;
  target: Node;
}

export interface FlowState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  addNode: (label: string) => void;
  addSuggestionFromNode: (sourceNodeId: string) => void;
  initializeFlow: () => void;
}
