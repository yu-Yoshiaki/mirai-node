import React, { useRef, useEffect, useState, useMemo } from 'react';
import { MandalaNode } from '../types';
import { useMandalaStore } from '../store/useMandalaStore';

// 定数定義
const CELL_SIZE = 90;
const GRID_SIZE = CELL_SIZE * 9;

export const MandalaChart: React.FC = () => {
  const mandalaNodes = useMandalaStore((state) => state.mandalaNodes);
  const currentMandalaId = useMandalaStore((state) => state.currentMandalaId);
  const setCurrentMandalaId = useMandalaStore((state) => state.setCurrentMandalaId);
  const generateMandalaChart = useMandalaStore((state) => state.generateMandalaChart);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newTopic, setNewTopic] = useState('');

  useEffect(() => {
    if (mandalaNodes.length > 0 && !currentMandalaId) {
      const firstCenterNode = mandalaNodes.find(node => node.isCenter);
      if (firstCenterNode) {
        setCurrentMandalaId(firstCenterNode.id);
      }
    }
  }, [mandalaNodes, currentMandalaId, setCurrentMandalaId]);

  const currentMandala = useMemo(() => 
    mandalaNodes.find(node => node.id === currentMandalaId),
    [mandalaNodes, currentMandalaId]
  );

  // relatedNodesの取得を修正
  const relatedNodes = useMemo(() => {
    if (!currentMandala) return [];
    
    // 中心ノード
    const centerNode = currentMandala;
    
    // 中心ノードに紐づく主要カテゴリーノード(8つ)
    const mainNodes = mandalaNodes.filter(node => node.parentId === centerNode.id);
    
    // 9ノードを適切な順序で配置
    const positionedNodes = [
      mainNodes[0],
      mainNodes[1],
      mainNodes[2],
      mainNodes[3],
      centerNode,     // 中央に配置
      mainNodes[4],
      mainNodes[5],
      mainNodes[6],
      mainNodes[7],
    ];
    
    return positionedNodes;
  }, [currentMandala, mandalaNodes]);

  const handleCreateNewMandala = async () => {
    if (!newTopic || isLoading) return;
    
    setIsLoading(true);
    try {
      await generateMandalaChart(newTopic);
      setNewTopic('');
    } catch (error) {
      console.error('Failed to generate mandala:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCell = (node: MandalaNode | undefined, index: number, parentNode?: MandalaNode) => {
    const isCenter = index === 4;
    
    return (
      <div
        key={`${parentNode?.id || 'root'}-${index}`}
        className={`
          w-[90px] h-[90px] flex items-center justify-center text-white text-center p-2
          ${isCenter ? 'bg-blue-800' : 'bg-gray-800'}
          transition-colors duration-200 text-[11px] border border-gray-900
        `}
        title={node?.label}
      >
        <span className="break-words leading-tight">
          {node?.label || '...'}
        </span>
      </div>
    );
  };

  const renderGrid = (node: MandalaNode | undefined, idx: number) => {
    if (!node) return null;

    // 子ノードを取得して3x3グリッドを構成
    const childNodes = mandalaNodes.filter(n => n.parentId === node.id);
    const gridElements = Array.from({ length: 9 }, (_, index) => {
      if (index === 4) {
        return node;
      } else {
        const childIndex = index > 4 ? index - 1 : index;
        return childNodes[childIndex];
      }
    });

    // 行と列の位置を計算
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    const SUB_GRID_SIZE = CELL_SIZE * 3;

    // 位置の計算
    const top = row * SUB_GRID_SIZE;
    const left = col * SUB_GRID_SIZE;

    return (
      <div
        key={node.id}
        className="grid grid-cols-3 bg-gray-900 absolute"
        style={{
          width: `${SUB_GRID_SIZE}px`,
          height: `${SUB_GRID_SIZE}px`,
          top: `${top}px`,
          left: `${left}px`,
        }}
      >
        {gridElements.map((element, i) => renderCell(element, i, node))}
      </div>
    );
  };

  if (!currentMandala) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-white gap-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="新しい目標を入力"
            className="px-4 py-2 bg-gray-800 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateNewMandala();
              }
            }}
          />
          <button
            onClick={handleCreateNewMandala}
            disabled={isLoading || !newTopic}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white"
          >
            {isLoading ? '生成中...' : '作成'}
          </button>
        </div>
        <p className="text-gray-400">または既存のマンダラチャートを選択してください</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative bg-black overflow-auto"
      style={{ 
        height: 'calc(100vh - 80px)',
        padding: '40px 0'
      }}
    >
      <div 
        className="absolute inset-0 flex items-center justify-center min-h-full"
      >
        <div 
          className="relative"
          style={{ 
            width: `${GRID_SIZE}px`,
            height: `${GRID_SIZE}px`
          }}
        >
          {relatedNodes.map((node, idx) => renderGrid(node, idx))}
        </div>
      </div>
    </div>
  );
};

export default MandalaChart;
