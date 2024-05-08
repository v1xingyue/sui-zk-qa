import {
  ConnectButton,
  useCurrentAccount,
  useSuiClientQuery,
} from "@mysten/dapp-kit";

const QARewardList = () => {
  const account = useCurrentAccount();
  const { data, isPending, error } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address as string,
      filter: {
        Package:
          "0xbf1191f9741508d4981d66b04883dbff9f8f4e5aeb67e2d8907ee991fb3f20ee",
      },
      options: {
        showContent: true,
        showDisplay: true,
      },
    },
    {
      enabled: !!account,
    }
  );

  if (!account) {
    return;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (isPending || !data) {
    return <p>Loading...</p>;
  }

  return (
    <div className="card">
      <h2>Box with QA Reward : </h2>
      {data.data.length === 0 ? (
        <p>No objects owned by the connected wallet</p>
      ) : (
        <h2>Objects owned by the connected wallet</h2>
      )}
      {data.data.map((item: any) => {
        return <>{JSON.stringify(item)}</>;
      })}
    </div>
  );
};

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
