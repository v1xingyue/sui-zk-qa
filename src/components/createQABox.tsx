import { TransactionBlock } from "@mysten/sui.js/transactions";
import blake2b from "blake2b";
import { contract } from "../config";
import { ZkSendLinkBuilder, listCreatedLinks } from "@mysten/zksend";
import {
  useCurrentAccount,
  useSignAndExecuteTransactionBlock,
} from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import { Line } from "./line";
import { ShowToolTip } from "../tooltip";
import { QAPayload, defaultPayload } from "../types";
import { time } from "console";
import { send } from "process";

const ZkLinkHistory = () => {
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

export const CreateQALinks = () => {
  const [sendNow, setSendNow] = useState<boolean>(false);
  const [timer, setTimer] = useState<any>(null);
  const [txb, setTxb] = useState<TransactionBlock | null>(null);
  const [createDisable, setCreateDisable] = useState<boolean>(false);
  const [delaySeconds, setDelaySeconds] = useState<number>(-1);
  const [zkLink, setZkLink] = useState<string>("");
  const [payload, setPayload] = useState<QAPayload>(defaultPayload);
  const { mutate: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();
  const account = useCurrentAccount();

  useEffect(() => {
    console.log(txb, sendNow);
    if (txb && sendNow) {
      console.log("Sending transaction");
      if (timer) {
        clearInterval(timer);
      }
      signAndExecuteTransactionBlock(
        {
          transactionBlock: txb as any,
        },
        {
          onSuccess: (result: any) => {
            console.log(result);
          },
          onError: (error: any) => {
            console.log(error);
            ShowToolTip(error.message, -300, -300);
          },
        }
      );
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [txb, timer, sendNow, signAndExecuteTransactionBlock]);

  if (!account) {
    return null;
  }

  const createQABox = async () => {
    setCreateDisable(true);
    const { challenge, answer } = payload;
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

    let delaySeconds = 5;
    setDelaySeconds(delaySeconds);
    setTxb(ntxb as any);
    const timer = setInterval(() => {
      delaySeconds--;
      setDelaySeconds(delaySeconds);
      if (delaySeconds == 0 || sendNow) {
        clearInterval(timer);
        setDelaySeconds(-1);
        setSendNow(true);
      }
    }, 1000);
    setTimer(timer);
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
                <button
                  onClick={() => {
                    setDelaySeconds(0);
                    setSendNow(true);
                  }}
                >
                  Rember and Send{" "}
                </button>
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
      <ZkLinkHistory />
    </>
  );
};
