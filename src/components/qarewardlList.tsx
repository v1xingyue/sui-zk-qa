import {
  useCurrentAccount,
  useSignAndExecuteTransactionBlock,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useState } from "react";
import { contract } from "../config";

interface QABox {
  question: string;
  boxType: string;
  boxID: string;
}

export const QARewardList = () => {
  const [transferToAddress, setTransferToAddress] = useState("");
  const [transferModal, setTransferModal] = useState(false);
  const [modal, setModal] = useState(false);
  const [box, setBox] = useState<QABox>();
  const [answer, setAnswer] = useState("");

  const account = useCurrentAccount();

  const { mutate: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();

  const { data, isPending, error } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address as string,
      filter: {
        Package: contract,
      },
      options: {
        showContent: true,
        showDisplay: false,
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
    <div>
      {data.data.length === 0 ? (
        <p>No objects owned by the connected wallet</p>
      ) : (
        <h2>Box with QA Reward : </h2>
      )}
      {data.data.map((item: any) => {
        return (
          <div className="card" key={item.data.objectId}>
            <span className="question">
              Q: {item.data.content.fields.question}{" "}
            </span>
            <span>
              <button
                className="mycommon"
                onClick={async () => {
                  setBox({
                    question: item.data.content.fields.question,
                    boxType: item.data.content.type,
                    boxID: item.data.objectId,
                  });
                  setModal(true);
                }}
              >
                Answer !!
              </button>
              <button
                className="mycommon"
                onClick={async () => {
                  setBox({
                    question: item.data.content.fields.question,
                    boxType: item.data.content.type,
                    boxID: item.data.objectId,
                  });
                  setTransferModal(true);
                }}
              >
                Transfer
              </button>
            </span>
          </div>
        );
      })}

      {transferModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setModal(false)}>
              &times;
            </span>
            <input
              type="text"
              placeholder="Transfer To Address"
              value={transferToAddress}
              onChange={(e) => setTransferToAddress(e.target.value)}
            />
            <button
              className="mycommon"
              onClick={() => {
                if (box?.boxID === undefined) {
                  return;
                }
                const txb = new TransactionBlock();

                txb.transferObjects(
                  [txb.object(box?.boxID)],
                  txb.pure.address(transferToAddress)
                );

                signAndExecuteTransactionBlock(
                  {
                    transactionBlock: txb as any,
                  },
                  {
                    onSuccess: (result: any) => {
                      console.log(result);
                      setModal(false);
                    },
                    onError: (error: any) => {
                      console.error(error);
                      setModal(false);
                    },
                  }
                );
              }}
            >
              Do Transfer
            </button>
          </div>
        </div>
      )}

      {modal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setTransferModal(false)}>
              &times;
            </span>
            <p>
              Q: {box?.question} <br />
            </p>
            <input
              type="text"
              placeholder="Your Really Answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <button
              className="mycommon"
              onClick={() => {
                const coinType = "0x2::sui::SUI";
                const txb = new TransactionBlock();
                txb.moveCall({
                  target: `${contract}::zkqa::get_coin_reward`,
                  typeArguments: [coinType],
                  arguments: [
                    txb.pure(box?.boxID),
                    txb.pure(String(answer).trim()),
                  ],
                });
                signAndExecuteTransactionBlock(
                  {
                    transactionBlock: txb as any,
                  },
                  {
                    onSuccess: (result: any) => {
                      console.log(result);
                      setModal(false);
                    },
                    onError: (error: any) => {
                      console.error(error);
                      setModal(false);
                    },
                  }
                );
              }}
            >
              Answer !!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
