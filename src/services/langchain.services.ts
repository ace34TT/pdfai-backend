import { ConversationalRetrievalQAChain } from "langchain/chains";

export const ask = async (
  question: any,
  chain: ConversationalRetrievalQAChain
) => {
  return await chain.call({ question, chat_history: [] });
};
