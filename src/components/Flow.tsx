import React, { useCallback } from 'react';
import { useFlowStore } from '../store/useFlowStore';
import { NodeDetail } from './NodeDetail';
import { NeuralFlow } from './NeuralFlow';

export const Flow: React.FC = () => {
  const { 
    nodes, 
    edges, 
    initializeFlow, 
    addSuggestionFromNode,
    selectedNodeId,
    setSelectedNodeId
  } = useFlowStore();

  React.useEffect(() => {
    initializeFlow();
  }, [initializeFlow]);

  const onNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, [setSelectedNodeId]);

  const selectedNode = nodes.find(node => node.id === selectedNodeId);

  return (
    <div className="w-full h-screen">
      <NeuralFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={onNodeClick}
      />
      {selectedNode && (
        <NodeDetail
          id={selectedNode.id}
          label={selectedNode.data.label}
          nodeType={selectedNode.data.nodeType}
          onClose={() => setSelectedNodeId(null)}
          onAddSuggestion={addSuggestionFromNode}
        />
      )}
    </div>
  );
};