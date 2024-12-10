import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useFlowStore } from '../store/useFlowStore';

interface InputFormProps {
  onSubmit: (text: string) => void;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit }) => {
  const [input, setInput] = useState('');
  const selectedNodeId = useFlowStore(state => state.selectedNodeId);
  const selectedNode = useFlowStore(state => 
    state.nodes.find(node => node.id === state.selectedNodeId)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-xl px-4"
    >
      <div className="flex flex-col gap-2">
        {selectedNode && (
          <div className="text-sm text-purple-200 text-center bg-gray-900/90 backdrop-blur-lg px-3 py-1 rounded-lg shadow-lg border border-purple-500/30">
            「{selectedNode.data.label}」から新しい行動を追加
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedNode ? "選択したノードから新しい行動を入力..." : "新しい行動を入力..."}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-900/90 backdrop-blur-lg border border-purple-500/30 text-purple-200 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </form>
  );
};