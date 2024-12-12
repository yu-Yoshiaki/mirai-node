import React from 'react';
import { useFlowStore } from '../store/useFlowStore';
import { useMandalaStore } from '../store/useMandalaStore';
import { ViewMode } from '../types';

export const Sidebar: React.FC = () => {
  const viewMode = useFlowStore((state) => state.viewMode);
  const setViewMode = useFlowStore((state) => state.setViewMode);
  const mandalaNodes = useMandalaStore((state) => state.mandalaNodes);
  const setCurrentMandalaId = useMandalaStore((state) => state.setCurrentMandalaId);
  const currentMandalaId = useMandalaStore((state) => state.currentMandalaId);

  const handleModeChange = (mode: ViewMode) => {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', mode);
    window.history.pushState({}, '', url.toString());
    setViewMode(mode);
  };

  return (
    <div className="flex">
      <div className="w-64 h-screen bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">表示形式</h2>
        <div className="space-y-2">
          <button
            className={`w-full p-2 rounded ${
              viewMode === 'neural'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            onClick={() => handleModeChange('neural')}
          >
            ニューロン型マインドマップ
          </button>
          <button
            className={`w-full p-2 rounded ${
              viewMode === 'mandala'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            onClick={() => handleModeChange('mandala')}
          >
            マンダラチャート
          </button>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">機能説明</h3>
          {viewMode === 'neural' ? (
            <p className="text-sm text-gray-300">
              やったことメッセージを投げると、次に取るべき行動を生成します。
            </p>
          ) : (
            <p className="text-sm text-gray-300">
              目標メッセージを投げると、必要な要素を生成し、埋めてくれます。
            </p>
          )}
        </div>
      </div>

      {viewMode === 'mandala' && (
        <div className="w-64 h-screen bg-gray-800 text-white p-4 border-l border-gray-700">
          <h2 className="text-xl font-bold mb-4">マンダラチャート一覧</h2>
          <div className="space-y-2">
            {mandalaNodes
              .filter(node => node.isCenter)
              .map(node => (
                <button
                  key={node.id}
                  className={`w-full p-2 rounded text-left truncate ${
                    currentMandalaId === node.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => setCurrentMandalaId(node.id)}
                >
                  {node.label}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
