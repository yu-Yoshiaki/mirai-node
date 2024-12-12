import { SimulationNodeDatum } from "d3";

export type ViewMode = "neural" | "mandala";

export interface Node extends SimulationNodeDatum {
  id: string;
  type: "default";
  position: { x: number; y: number };
  data: {
    label: string;
    nodeType: "user" | "suggestion";
  };
  // D3.js simulation properties
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
  index?: number;
}

export interface Edge {
  id: string;
  source: string | Node;
  target: string | Node;
}

export interface Position {
  x: number;
  y: number;
}

export interface MandalaNode {
  id: string;
  label: string;
  parentId?: string;
  position?: Position;
  isCenter?: boolean; // 中央の3x3グリッドかどうか
  children?: MandalaNode[];
}

export interface FlowState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  viewMode: ViewMode;
  mandalaNodes: MandalaNode[];
  currentMandalaId: string | null;
  setViewMode: (mode: ViewMode) => void;
  setSelectedNodeId: (id: string | null) => void;
  setCurrentMandalaId: (id: string | null) => void;
  addNode: (label: string) => void;
  addSuggestionFromNode: (sourceNodeId: string) => void;
  initializeFlow: () => void;
  generateMandalaChart: (
    label: string,
    parentId?: string,
    position?: Position
  ) => void;
}
