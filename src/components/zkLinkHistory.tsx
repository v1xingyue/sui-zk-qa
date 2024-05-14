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
      <div>
        <table className="data">
          <thead>
            <tr>
              <td>Digest</td>
              <td>Claimed</td>
            </tr>
          </thead>
          <tbody>
            {links.map((link: any) => {
              return (
                <tr key={link.link.address}>
                  <td>{link.digest}</td>
                  <td>{JSON.stringify(link.claimed)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
