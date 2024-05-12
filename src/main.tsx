import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {
  SuiClientProvider,
  WalletProvider,
  createNetworkConfig,
  lightTheme,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui.js/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@mysten/dapp-kit/dist/index.css";
import { registerZkSendWallet } from "@mysten/zksend";
import { network } from "./config.ts";
import { darkTheme } from "./darkTheme.ts";

registerZkSendWallet("zkQA", { origin: "https://zksend.com" });
const queryClient = new QueryClient();

const defaultNetwork = network;

const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
  devnet: { url: getFullnodeUrl("devnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={networkConfig}
        defaultNetwork={defaultNetwork}
      >
        <WalletProvider
          autoConnect
          theme={[
            {
              variables: lightTheme,
            },
            {
              variables: darkTheme,
              mediaQuery: "(prefers-color-scheme: dark)",
            },
          ]}
        >
          <App />
          <div id="tooltip" className="tooltip">
            <span id="tooltiptext" className="tooltiptext"></span>
          </div>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
