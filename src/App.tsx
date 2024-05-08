import {
  ConnectButton,
  useCurrentAccount,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { useState } from "react";

interface QABox {
  question: string;
  answer: string;
}

const QARewardList = () => {
  const [modal, setModal] = useState(false);
  const [box, setBox] = useState<QABox>();

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
          <div className="card">
            <h3>
              Q: {item.data.content.fields.question}{" "}
              <button
                style={{
                  marginLeft: "20px",
                }}
                onClick={() => {
                  setModal(true);
                  setBox({
                    question: item.data.content.fields.question,
                    answer: "",
                  });
                }}
              >
                Answer !!
              </button>
            </h3>
          </div>
        );
      })}

      {modal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setModal(false)}>
              &times;
            </span>
            <p>
              Q: {box?.question} <br />
            </p>
            <input type="text" placeholder="Your Really Answer" />
            <button
              style={{
                marginLeft: "20px",
              }}
              onClick={() => {
                alert("Answered !!");
                setModal(false);
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
