import {
  useCurrentAccount,
  useSignAndExecuteTransactionBlock,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useState } from "react";

interface QABox {
  question: string;
  boxType: string;
  boxID: string;
}

const contract =
  "0xbf1191f9741508d4981d66b04883dbff9f8f4e5aeb67e2d8907ee991fb3f20ee";

export const QARewardList = () => {
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
    <>
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
                style={{
                  marginLeft: "20px",
                }}
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
            </span>
          </div>
        );
      })}

      {modal && (
        <div className="modal">
          <div className="modal-content">
            {JSON.stringify(box, null, 2)}
            <span className="close" onClick={() => setModal(false)}>
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
              style={{
                marginLeft: "20px",
              }}
              onClick={() => {
                const coinType = "0x2::sui::SUI";
                const txb = new TransactionBlock();
                txb.moveCall({
                  target: `${contract}::zkqa::get_coin_reward`,
                  typeArguments: [coinType],
                  arguments: [txb.pure(box?.boxID), txb.pure(answer)],
                });
                signAndExecuteTransactionBlock(
                  {
                    transactionBlock: txb,
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
    </>
  );
};
