import { ConnectButton } from "@mysten/dapp-kit";
import { QARewardList } from "./components/qarewardlList";
import { WalletStatus } from "./components/walletStatus";

const App = () => {
  return (
    <>
      <h1>Sui Zk QA </h1>
      <div className="card">
        <ConnectButton />
        <WalletStatus />
      </div>
      <QARewardList />
    </>
  );
};

export default App;
