import { TransactionBlock } from "@mysten/sui.js/transactions";
import blake2b from "blake2b";
import { contract } from "../config";
import { ZkSendLinkBuilder, listCreatedLinks } from "@mysten/zksend";
import {
  useCurrentAccount,
  useSignAndExecuteTransactionBlock,
} from "@mysten/dapp-kit";
import { useEffect, useState } from "react";

export const CreateQALinks = () => {
  const [zkLink, setZkLink] = useState<string>("");
  const [links, setLinks] = useState<any[]>([]);

  const { mutate: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();
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
  if (!account) {
    return null;
  }

  const createQABox = async () => {
    const challenge = "1 + 1 = ?";
    const answer = "2";

    // const challenge = "What is sui organazation repo link with github ?";
    // const answer = "https://github.com/MystenLabs/sui";

    const output = new Uint8Array(32);

    const encoder = new TextEncoder();
    const input = encoder.encode(answer);

    const hash = blake2b(output.length).update(input);

    const builder = new ZkSendLinkBuilder({
      sender: account.address,
      redirect: {
        url: "https://sui-zk-qa.vercel.app/",
        name: "cratetors",
      },
    });

    const txb = new TransactionBlock();
    const [reward] = txb.splitCoins(txb.gas, [txb.pure(100)]);
    const [reward_balance] = txb.moveCall({
      target: "0x2::coin::into_balance",
      typeArguments: ["0x2::sui::SUI"],
      arguments: [reward],
    });
    const [box] = txb.moveCall({
      target: `${contract}::zkqa::new`,
      typeArguments: ["0x2::balance::Balance<0x2::sui::SUI>"],
      arguments: [
        txb.pure.string(challenge),
        txb.pure(hash.digest("hex")),
        reward_balance,
      ],
    });

    builder.addClaimableObjectRef(
      box,
      `${contract}::zkqa::QABox<0x2::balance::Balance<0x2::sui::SUI>>`
    );

    console.log(builder.getLink());
    setZkLink(builder.getLink());

    const ntxb = await builder.createSendTransaction({
      transactionBlock: txb as any,
    });

    signAndExecuteTransactionBlock(
      {
        transactionBlock: ntxb,
      },
      {
        onSuccess: (result: any) => {
          console.log(result);
        },
      }
    );
  };

  return (
    <>
      <div className="card">
        <h2>Link History:</h2>
        {links.map((link: any) => {
          return <p>{link.link.address}</p>;
        })}
      </div>

      {zkLink == "" ? null : <a href={zkLink}>{zkLink}</a>}
      <button onClick={createQABox}>Create QA Box</button>
    </>
  );
};
