import { ConnectButton } from "@mysten/dapp-kit";
import { QARewardList } from "./components/qarewardlList";
import { WalletStatus } from "./components/walletStatus";
import { CreateQALinks } from "./components/createQABox";
import { Line } from "./components/line";

const App = () => {
  return (
    <>
      <h1>Sui Zk QA </h1>
      <div className="card">
        <ConnectButton />
        <WalletStatus />
      </div>
      <Line />
      <QARewardList />
      <Line />
      <CreateQALinks />
    </>
  );
};

export default App;
