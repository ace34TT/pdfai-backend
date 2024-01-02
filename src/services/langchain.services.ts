import { ConversationalRetrievalQAChain } from "langchain/chains";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { embedding, model } from "../configs/openai.config";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import path from "path";
const tempDirectory = path.resolve(__dirname, "../tmp/");

export const ask = async (
  question: any,
  chain: ConversationalRetrievalQAChain
) => {
  return await chain.call({ question, chat_history: [] });
};
export const init = async (filename: string) => {
  const loader = new PDFLoader(path.resolve(tempDirectory, filename));
  const data = await loader.load();
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
  });
  const docs = await textSplitter.splitDocuments(data);
  const vectorStore = await MemoryVectorStore.fromDocuments(docs, embedding);
  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever()
  );
  return chain;
};
