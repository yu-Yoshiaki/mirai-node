import { Flow } from './components/Flow';
import { InputForm } from './components/InputForm';
import Sidebar from './components/Sidebar';
import MandalaChart from './components/MandalaChart';
import { useFlowStore } from './store/useFlowStore';

function App() {
  const addNode = useFlowStore((state) => state.addNode);
  const viewMode = useFlowStore((state) => state.viewMode);

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
