import React, { useRef, useEffect, useState, useMemo } from 'react';
import { MandalaNode } from '../types';
import { useMandalaStore } from '../store/useMandalaStore';
import { generateMandalaContent } from '../utils/mandalaOpenai';

// 定数定義
const CELL_SIZE = 60; // 1マスのサイズを小さく調整
const GRID_SIZE = CELL_SIZE * 3; // 3x3グリッド全体のサイズ

export const MandalaChart: React.FC = () => {
  const mandalaNodes = useMandalaStore((state) => state.mandalaNodes);
  const currentMandalaId = useMandalaStore((state) => state.currentMandalaId);
  const setCurrentMandalaId = useMandalaStore((state) => state.setCurrentMandalaId);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const addNode = useMandalaStore((state) => state.addNode);
  const updateNode = useMandalaStore((state) => state.updateNode);
  const [newTopic, setNewTopic] = useState('');

  // 最初のマンダラチャートが表示されたときに自動的に選択
  useEffect(() => {
    if (mandalaNodes.length > 0 && !currentMandalaId) {
      const firstCenterNode = mandalaNodes.find(node => node.isCenter);
      if (firstCenterNode) {
        setCurrentMandalaId(firstCenterNode.id);
      }
    }
  }, [mandalaNodes, currentMandalaId, setCurrentMandalaId]);

  const currentMandala = mandalaNodes.find(node => 
    node.isCenter && node.id === currentMandalaId
  );

  const handleGenerateTopics = async () => {
    if (!currentMandala) return;
    
    setIsLoading(true);
    try {
      const topics = await generateMandalaContent(currentMandala.label);
      
      // 既存の子ノードを更新または新規作成
      topics.forEach((topic: string, index: number) => {
        const existingChild = currentMandala.children?.[index];
        if (existingChild) {
          // 既存のノードを更新
          updateNode({
            ...existingChild,
            label: topic
          });
        } else {
          // 新規ノードを作成
          addNode({
            id: `${currentMandala.id}-${index}`,
            label: topic,
            parentId: currentMandala.id,
            isCenter: false,
            children: [],
            position: { x: 0, y: 0 }
          });
        }
      });
    } catch (error) {
      console.error('Failed to generate topics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewMandala = async () => {
    if (!newTopic || isLoading) return;
    
    setIsLoading(true);
    try {
      const topics = await generateMandalaContent(newTopic);
      
      // 中心��ードを作成
      const newNodeId = `mandala-${Date.now()}`;
      const centerNode = {
        id: newNodeId,
        label: newTopic,
        parentId: undefined,
        isCenter: true,
        children: [],
        position: { x: 0, y: 0 }
      };
      
      addNode(centerNode);
      setCurrentMandalaId(newNodeId);

      // サブトピックを追加
      topics.forEach((topic: string, index: number) => {
        addNode({
          id: `${newNodeId}-${index}`,
          label: topic,
          parentId: newNodeId,
          isCenter: false,
          children: [],
          position: { x: 0, y: 0 }
        });
      });

      setNewTopic(''); // 入力をクリア
    } catch (error) {
      console.error('Failed to generate mandala:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // relatedNodesの取得を修正
  const relatedNodes = useMemo(() => {
    if (!currentMandala) return [];
    
    // 中心ノードを取得
    const centerNode = currentMandala;
    
    // 子ノード（8つの要素）を取得
    const childNodes = mandalaNodes.filter(node => node.parentId === centerNode.id);
    
    // 中心ノードと子ノードを結合
    return [centerNode, ...childNodes];
  }, [currentMandala, mandalaNodes]);

  const renderGrid = (node: MandalaNode) => {
    if (!node) return null;

    // 子ノードを取得（parentIdで紐付いているノードを探す）
    const childNodes = mandalaNodes.filter(n => n.parentId === node.id);

    const gridElements = Array.from({ length: 9 }, (_, index) => {
      if (index === 4) {
        return node;
      } else {
        const childIndex = index > 4 ? index - 1 : index;
        return childNodes[childIndex];
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
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
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
      style={{ height: 'calc(100vh - 80px)' }}
    >
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={handleGenerateTopics}
          disabled={isLoading || !currentMandala}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? '生成中...' : 'AIでアイデア生成'}
        </button>
      </div>
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
          {relatedNodes.map((chart) => renderGrid(chart))}
        </div>
      </div>
    </div>
  );
};

export default MandalaChart;
