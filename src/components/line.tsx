import { useCurrentAccount } from "@mysten/dapp-kit";

export const Line = () => {
  const account = useCurrentAccount();
  if (account) {
    return <hr />;
  } else {
    return null;
  }
};
