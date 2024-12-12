import React, { useRef } from 'react';
import { MandalaNode } from '../types';
import { useMandalaStore } from '../store/useMandalaStore';

// 定数定義
const CELL_SIZE = 60; // 1マスのサイズを小さく調整
const GRID_SIZE = CELL_SIZE * 3; // 3x3グリッド全体のサイズ

export const MandalaChart: React.FC = () => {
  const mandalaNodes = useMandalaStore((state) => state.mandalaNodes);
  const containerRef = useRef<HTMLDivElement>(null);

  const renderGrid = (node: MandalaNode) => {
    if (!node) return null;

    const gridElements = Array.from({ length: 9 }, (_, index) => {
      if (index === 4) {
        return node;
      } else {
        const childIndex = index > 4 ? index - 1 : index;
        return node.children?.[childIndex];
      }
    });

    const position = node.position || { x: 0, y: 0 };
    const gridStyle = {
      transform: `translate(${position.x}px, ${position.y}px)`,
      position: 'absolute' as const,
      left: '50%',
      top: '50%',
      marginLeft: `-${GRID_SIZE / 2}px`,
      marginTop: `-${GRID_SIZE / 2}px`,
    };

    return (
      <div
        key={node.id}
        className="grid grid-cols-3 bg-gray-900"
        style={gridStyle}
      >
        {gridElements.map((element, index) => {
          const isCenter = index === 4;
          return (
            <div
              key={`${node.id}-${index}`}
              className={`
                w-[60px] h-[60px] flex items-center justify-center text-white text-center p-2
                ${isCenter ? 'bg-blue-800' : 'bg-gray-800'}
                transition-colors duration-200 text-xs border border-gray-900
              `}
            >
              {element?.label || '...'}
            </div>
          );
        })}
      </div>
    );
  };

  if (mandalaNodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p>目標を入力してください</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative bg-black overflow-auto"
      style={{ height: 'calc(100vh - 80px)' }}
    >
      <div 
        className="absolute inset-0 flex items-center justify-center"
      >
        <div 
          className="relative"
          style={{ 
            width: '900px',
            height: '900px'
          }}
        >
          {mandalaNodes.map((chart) => renderGrid(chart))}
        </div>
      </div>
    </div>
  );
};

export default MandalaChart;
