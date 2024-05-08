import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {
  SuiClientProvider,
  WalletProvider,
  createNetworkConfig,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui.js/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@mysten/dapp-kit/dist/index.css";
import { registerZkSendWallet } from "@mysten/zksend";

registerZkSendWallet("zkqa", { origin: "https://zksend.com/" });

const queryClient = new QueryClient();

const { networkConfig } = createNetworkConfig({
  mainnet: { url: getFullnodeUrl("mainnet") },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider autoConnect={true}>
          <App />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
