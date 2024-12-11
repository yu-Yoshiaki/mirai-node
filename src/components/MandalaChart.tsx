import React, { useRef, useState } from 'react';
import { useFlowStore } from '../store/useFlowStore';
import { MandalaNode } from '../types';
import { isPositionOccupied } from '../utils/mandala';

// 定数定義
const CELL_SIZE = 80; // 1マスのサイズ
const GRID_SIZE = CELL_SIZE * 3; // 3x3グリッド全体のサイズ
const INITIAL_SCALE = 0.8; // 初期スケール

export const MandalaChart: React.FC = () => {
  const mandalaNodes = useFlowStore((state) => state.mandalaNodes);
  const generateMandalaChart = useFlowStore((state) => state.generateMandalaChart);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(INITIAL_SCALE);

  // マウスホイールでの拡大縮小
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.min(Math.max(0.3, prev + delta), 2));
  };

  const handleElementClick = (element: MandalaNode, index: number, parentNode: MandalaNode) => {
    if (!element || index === 4) return;
    if (!parentNode.isCenter) return; // 中央グリッド以外はクリック不可

    // クリックされたマスの位置に基づいて新しい位置を計算
    const row = Math.floor(index / 3);
    const col = index % 3;

    const baseX = parentNode.position?.x || 0;
    const baseY = parentNode.position?.y || 0;

    // 新しい位置を計算（グリッドをピッタリくっつける）
    const newPosition = {
      x: baseX + ((col - 1) * GRID_SIZE),
      y: baseY + ((row - 1) * GRID_SIZE)
    };

    // 指定された位置に既にグリッドが存在するかチェック
    if (isPositionOccupied(newPosition, mandalaNodes)) {
      return;
    }

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
      marginLeft: '-120px', // グリッドの半分の幅
      marginTop: '-120px',  // グリッドの半分の高さ
    };

    return (
      <div
        key={node.id}
        className="grid grid-cols-3 bg-gray-900"
        style={gridStyle}
      >
        {gridElements.map((element, index) => {
          const isCenter = index === 4;
          const newPosition = element && !isCenter ? {
            x: position.x + ((index % 3 - 1) * GRID_SIZE),
            y: position.y + (Math.floor(index / 3) - 1) * GRID_SIZE
          } : null;
          const isOccupied = newPosition ? isPositionOccupied(newPosition, mandalaNodes) : false;
          const canClick = node.isCenter && !isCenter && !isOccupied;

          return (
            <div
              key={`${node.id}-${index}`}
              onClick={() => element && canClick && handleElementClick(element, index, node)}
              className={`
                w-[80px] h-[80px] flex items-center justify-center text-white text-center p-2
                ${isCenter ? 'bg-blue-800' : 'bg-gray-800'}
                ${canClick ? 'hover:bg-gray-700 cursor-pointer' : ''}
                transition-colors duration-200 text-xs border border-gray-900
              `}
              title={!node.isCenter ? '展開できません' : isOccupied ? '既に展開済みです' : ''}
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
      onWheel={handleWheel}
      className="w-full h-full relative bg-black overflow-auto"
      style={{ height: 'calc(100vh - 80px)' }}
    >
      <div 
        className="absolute inset-0 flex items-center justify-center"
      >
        <div 
          className="relative origin-center"
          style={{ 
            transform: `scale(${scale})`,
            transition: 'transform 0.1s ease-out',
            width: '3000px',
            height: '3000px'
          }}
        >
          {mandalaNodes.map((chart) => renderGrid(chart))}
        </div>
      </div>
      <div className="absolute bottom-4 right-4 text-white text-sm bg-gray-800 px-3 py-1 rounded-full opacity-80">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
};

export default MandalaChart;
