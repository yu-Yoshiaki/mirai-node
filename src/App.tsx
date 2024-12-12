import  { useEffect } from 'react';
import { Flow } from './components/Flow';
import { InputForm } from './components/InputForm';
import { MandalaChart } from './components/MandalaChart';
import { Sidebar } from './components/Sidebar';
import { useFlowStore } from './store/useFlowStore';
import { useMandalaStore } from './store/useMandalaStore';
import { ViewMode } from './types';

function App() {
  const addNode = useFlowStore((state) => state.addNode);
  const viewMode = useFlowStore((state) => state.viewMode);
  const setViewMode = useFlowStore((state) => state.setViewMode);
  const initializeFlow = useFlowStore((state) => state.initializeFlow);
  const initializeMandala = useMandalaStore((state) => state.initializeMandala);

  // URLクエリパラメータの監視
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode') as ViewMode;
    if (mode && (mode === 'neural' || mode === 'mandala')) {
      setViewMode(mode);
    }

    // ブラウザの戻る/進むボタンの監視
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode') as ViewMode;
      if (mode && (mode === 'neural' || mode === 'mandala')) {
        setViewMode(mode);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setViewMode]);

  useEffect(() => {
    initializeFlow();
    initializeMandala();
  }, [initializeFlow, initializeMandala]);

  return (
    <div className="flex w-full h-screen bg-black">
      <Sidebar />
      <div className="flex-1 relative">
        {viewMode === 'neural' ? <Flow /> : <MandalaChart />}
        <InputForm onSubmit={addNode} />
      </div>
    </div>
  );
}

export default App;
