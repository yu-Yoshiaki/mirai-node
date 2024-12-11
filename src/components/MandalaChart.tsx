import React from 'react';
import { useFlowStore } from '../store/useFlowStore';

export const MandalaChart: React.FC = () => {
  const nodes = useFlowStore((state) => state.nodes);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="grid grid-cols-3 gap-2 bg-gray-900 p-4 rounded-lg">
        {Array.from({ length: 9 }).map((_, index) => {
          const node = nodes[index];
          return (
            <div
              key={index}
              className="w-40 h-40 bg-gray-800 rounded-lg p-4 flex items-center justify-center text-white text-center"
            >
              {node ? node.data.label : '目標を入力してください'}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MandalaChart;
