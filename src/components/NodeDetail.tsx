import React from 'react';
import { X, Plus } from 'lucide-react';

interface NodeDetailProps {
  id: string;
  label: string;
  nodeType: 'user' | 'suggestion';
  onClose: () => void;
  onAddSuggestion: (id: string) => void;
}

export const NodeDetail: React.FC<NodeDetailProps> = ({ 
  id, 
  label, 
  nodeType, 
  onClose, 
  onAddSuggestion
}) => {
  const handleAddSuggestion = () => {
    onAddSuggestion(id);
    onClose();
  };

  return (
    <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-lg p-4 rounded-lg shadow-2xl w-64 border border-purple-500/30">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-purple-200">ノード詳細</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <div className="space-y-2">
        <div className="text-sm font-medium text-purple-300">
          {nodeType === 'user' ? 'あなたの行動' : '次のステップ'}
        </div>
        <p className="text-gray-300">{label}</p>
        <div className="flex flex-col gap-2 mt-4">
          <button
            onClick={handleAddSuggestion}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-purple-200 hover:bg-purple-900/50 rounded-lg transition-colors border border-purple-500/30"
          >
            <Plus size={16} />
            <span>新しい提案を追加</span>
          </button>
        </div>
      </div>
    </div>
  );
};