import { ConnectButton } from "@mysten/dapp-kit";
import { QARewardList } from "./components/qarewardlList";

const App = () => {
  return (
    <>
      <h1>Sui Zk QA </h1>
      <div className="card">
        <ConnectButton />
      </div>
      <QARewardList />
    </>
  );
};

export default App;
