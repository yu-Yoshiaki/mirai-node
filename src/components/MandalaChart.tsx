import React, { useEffect, useRef, useState } from 'react';
import { useFlowStore } from '../store/useFlowStore';
import { MandalaNode } from '../types';
import { calculateNewGridPosition } from '../utils/mandala';

export const MandalaChart: React.FC = () => {
  const mandalaNodes = useFlowStore((state) => state.mandalaNodes);
  const generateMandalaChart = useFlowStore((state) => state.generateMandalaChart);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // マウスホイールでの拡大縮小
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.1, scale + delta), 2);
    setScale(newScale);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [scale]);

  const handleElementClick = (element: MandalaNode, index: number, parentNode: MandalaNode) => {
    if (!element || index === 4) return; // 中央のマスはクリック不可

    const newPosition = calculateNewGridPosition(index, parentNode.position);
    generateMandalaChart(element.label, element.parentId, newPosition);
  };

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
      marginLeft: '-200px', // グリッドの半分の幅
      marginTop: '-200px',  // グリッドの半分の高さ
      width: '400px',       // グリッドの全体幅
      height: '400px',      // グリッドの全体高さ
    };

    return (
      <div
        key={node.id}
        className="grid grid-cols-3 gap-4 bg-gray-900 p-6 rounded-lg"
        style={gridStyle}
      >
        {gridElements.map((element, index) => {
          const isCenter = index === 4;

          return (
            <div
              key={`${node.id}-${index}`}
              onClick={() => element && !isCenter && handleElementClick(element, index, node)}
              className={`
                aspect-square flex items-center justify-center text-white text-center p-4 rounded-lg
                ${isCenter ? 'bg-blue-800' : 'bg-gray-800 hover:bg-gray-700 cursor-pointer'}
                transition-colors duration-200 text-sm
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
      className="w-full h-full relative bg-black overflow-hidden"
      style={{ height: 'calc(100vh - 80px)' }}
    >
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ 
          transform: `scale(${scale})`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <div className="relative">
          {mandalaNodes.map((chart) => renderGrid(chart))}
        </div>
      </div>
    </div>
  );
};

export default MandalaChart;
