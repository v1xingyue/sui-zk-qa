export interface QAPayload {
  challenge: string;
  answer: string;
  quantity: number;
  quantityInput: string;
  error: string;
}

export const defaultPayload: QAPayload = {
  challenge: "1 + 1 = ?",
  answer: "2",
  quantity: 0.001,
  quantityInput: "0.001",
  error: "",
};

// example challenge and answer
// const challenge = "1 + 1 = ?";
// const answer = "2";
// const challenge = "What is sui organazation repo link with github ?";
// const answer = "https://github.com/MystenLabs/sui";
