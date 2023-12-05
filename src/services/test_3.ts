import { OpenAI } from "langchain/llms/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import * as fs from "fs";
import * as dotenv from "dotenv";
import path from "path";
import { Document } from "langchain/document";
dotenv.config();
const tempDirectory = path.resolve(__dirname, "../tmp/");
export const run = async (data: Document<Record<string, any>>[]) => {
  const apiKey = process.env["OPENAI_API_KEY"];
  const model = new OpenAI({
    openAIApiKey: apiKey,
    modelName: "gpt-3.5-turbo",
    temperature: 0.2,
  });
  // const text = fs.readFileSync(
  //   path.resolve(tempDirectory, "document.txt"),
  //   "utf8"
  // );
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await textSplitter.splitDocuments(data);
  const vectorStore = await MemoryVectorStore.fromDocuments(
    docs,
    new OpenAIEmbeddings({
      openAIApiKey: apiKey,
      modelName: "text-embedding-ada-002",
    })
  );
  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever()
  );
  const question = "summarize this document";

  const res = await chain.call({ question, chat_history: [] });
  console.log(res);
  /* Follow up question */
  //   const chatHistory = question + res.text;
  //   const followUpRes = await chain.call({
  //     question: "Tell me something about the process of creating a design",
  //     chat_history: chatHistory,
  //   });
  //   console.log(followUpRes);
};

// run();
