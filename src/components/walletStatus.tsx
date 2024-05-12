import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";

export const WalletStatus = () => {
  const account = useCurrentAccount();
  const { data, isPending, isError } = useSuiClientQuery(
    "getBalance",
    {
      owner: account?.address as string,
      coinType: "0x2::sui::SUI",
    },
    {
      enabled: !!account,
      refetchInterval: 5000,
    }
  );

  if (isPending) {
    return null;
  }

  if (isError) {
    return <div>Fetching Error</div>;
  }

  return (
    <span className="card">
      <div className="cell">{account?.chains[0]}</div>
      <div className="cell">Balance: {Number(data.totalBalance) / 10 ** 9}</div>
    </span>
  );
};
