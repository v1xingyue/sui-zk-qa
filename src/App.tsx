import "./App.css";
import { ConnectButton } from "@mysten/dapp-kit";

function App() {
  return (
    <>
      <h1>Sui Zk QA </h1>
      <div className="card">
        <ConnectButton />
      </div>
    </>
  );
}

export default App;
