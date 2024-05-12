import { useCurrentAccount } from "@mysten/dapp-kit";
import { listCreatedLinks } from "@mysten/zksend";
import { useEffect, useState } from "react";

export const ZkLinkHistory = () => {
  const [links, setLinks] = useState<any[]>([]);
  const account = useCurrentAccount();
  useEffect(() => {
    if (account) {
      listCreatedLinks({
        address: account.address,
      }).then((data: any) => {
        setLinks(data.links);
      });
    }
  }, [account]);
  return (
    <div className="card">
      <h2>Sent History:</h2>
      {links.map((link: any) => {
        return (
          <div key={link.link.address}>
            <div className="cell line">{link.link.address}</div>
            <div className="cell line">{JSON.stringify(link.claimed)}</div>
          </div>
        );
      })}
    </div>
  );
};
