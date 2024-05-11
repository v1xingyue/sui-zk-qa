import { TransactionBlock } from "@mysten/sui.js/transactions";
import blake2b from "blake2b";
import { contract } from "../config";
import { ZkSendLinkBuilder, listCreatedLinks } from "@mysten/zksend";
import {
  useCurrentAccount,
  useSignAndExecuteTransactionBlock,
} from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import { ShowToolTip } from "../tooltip";
import { Line } from "./line";

interface QAPayload {
  challenge: string;
  answer: string;
  quantity: number;
  quantityInput: string;
  error: string;
}

export const CreateQALinks = () => {
  const [createDisable, setCreateDisable] = useState<boolean>(false);
  const [delaySeconds, setDelaySeconds] = useState<number>(-1);
  const [zkLink, setZkLink] = useState<string>("");
  const [links, setLinks] = useState<any[]>([]);
  const [payload, setPayload] = useState<QAPayload>({
    challenge: "1 + 1 = ?",
    answer: "2",
    quantity: 0.001,
    quantityInput: "0.001",
    error: "",
  });

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
  ShowToolTip("hello world", -300, 500);
  const createQABox = async () => {
    setCreateDisable(true);
    const challenge = payload.challenge;
    const answer = payload.answer;
    // const challenge = "1 + 1 = ?";
    // const answer = "2";
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
        name: "creators",
      },
    });

    const txb = new TransactionBlock();
    const [reward] = txb.splitCoins(txb.gas, [
      txb.pure(payload.quantity * 10 ** 9),
    ]);
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

    // txb.transferObjects([box], account.address);

    builder.addClaimableMist(BigInt(2_000_000));

    builder.addClaimableObjectRef(
      box,
      `${contract}::zkqa::QABox<0x2::balance::Balance<0x2::sui::SUI>>`
    );

    console.log(builder.getLink());
    setZkLink(builder.getLink());

    const ntxb = await builder.createSendTransaction({
      transactionBlock: txb as any,
    });

    let delaySeconds = 15;
    setDelaySeconds(delaySeconds);
    const timer = setInterval(() => {
      delaySeconds--;
      setDelaySeconds(delaySeconds);
      console.log(delaySeconds);
      if (delaySeconds == 0) {
        clearInterval(timer);
        setDelaySeconds(-1);

        signAndExecuteTransactionBlock(
          {
            transactionBlock: ntxb as any,
          },
          {
            onSuccess: (result: any) => {
              console.log(result);
            },
          }
        );
      }
    }, 1000);
  };

  return (
    <>
      <div className="card">
        <div>
          {payload.error == "" ? null : (
            <div className="error">
              <p>{payload.error}</p>
            </div>
          )}

          {zkLink != "" ? (
            <div>
              <a href={zkLink}>
                <strong>{zkLink}</strong>{" "}
              </a>
              <p>
                <strong>
                  Make sure You have remeber this link.
                  {delaySeconds > 0 ? (
                    <p>{delaySeconds} seconds left to send transaction.</p>
                  ) : null}
                </strong>
                <button>Rember and Send </button>
              </p>
            </div>
          ) : (
            <>
              <div>
                Challenge:{" "}
                <input
                  type="text"
                  value={payload.challenge}
                  onChange={(e) => {
                    setPayload({
                      ...payload,
                      challenge: e.target.value,
                    });
                  }}
                />
              </div>
              <div>
                Result:{" "}
                <input
                  type="text"
                  value={payload.answer}
                  onChange={(e) => {
                    setPayload({
                      ...payload,
                      answer: e.target.value,
                    });
                  }}
                />
              </div>
              <div>
                Quantity (SUI):{" "}
                <input
                  type="text"
                  value={payload.quantityInput}
                  onChange={(e: any) => {
                    let error = "";
                    const v = parseFloat(e.target.value);
                    if (isNaN(v)) {
                      error = "input must be number!";
                    }
                    setPayload({
                      ...payload,
                      quantityInput: e.target.value,
                      error,
                    });

                    setCreateDisable(error != "");
                  }}
                />
              </div>
              <button onClick={createQABox} disabled={createDisable}>
                Create QA Box
              </button>
            </>
          )}
        </div>
      </div>

      <Line />

      <div className="card">
        <h2>Sent History:</h2>
        {links.map((link: any) => {
          return (
            <p key={link.link.address}>
              <div className="cell">{link.link.address}</div>
              <div className="cell">{JSON.stringify(link.claimed)}</div>
            </p>
          );
        })}
      </div>
    </>
  );
};
