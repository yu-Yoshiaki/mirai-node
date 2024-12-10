export interface Node {
  id: string;
  type: 'default';
  position: { x: number; y: number };
  data: {
    label: string;
    nodeType: 'user' | 'suggestion';
  };
}

export interface Edge {
  id: string;
  source: string;
  target: string;
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