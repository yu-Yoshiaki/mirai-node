import { Flow } from './components/Flow';
import { InputForm } from './components/InputForm';
import { useFlowStore } from './store/useFlowStore';

function App() {
  const addNode = useFlowStore((state) => state.addNode);

  return (
    <div className="relative w-full h-screen bg-black">
      <Flow />
      <InputForm onSubmit={addNode} />
    </div>
  );
}

export default App;