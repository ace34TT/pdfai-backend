import fs from "fs";
import pdf from "pdf-parse";
import path from "path";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { FaissStore } from "langchain/vectorstores/faiss";
import { Document } from "langchain/document";

// import { OpenAIEmbeddings } from "langchain/embeddings/openai";

require("dotenv").config();
// import { openai } from "./configs/openai.config";

const tempDirectory = path.resolve(__dirname, "tmp/");
let embeddings = new OpenAIEmbeddings();

export const extractTextFromPdf = async (pdfName: string) => {
  const dataBuffer = fs.readFileSync(path.resolve(tempDirectory, pdfName));
  const data = await pdf(dataBuffer);
  return data.text;
};
function len(text: any) {
  return text.length;
}
export const splitText = async (text: string) => {
  const textSplitter = new CharacterTextSplitter({
    separator: "\n",
    chunkSize: 1000,
    chunkOverlap: 200,
    lengthFunction: len,
  });
  const chunks = await textSplitter.splitText(text);
  return chunks;
};

export const createChatbot = async (docs: any) => {
  const vectorStore = await FaissStore.fromDocuments(docs, embeddings);
  return vectorStore;
};

export const answerQuestion = (chatbot: FaissStore, question: any) => {
  const docs = chatbot.similaritySearch(question);
  return docs;
};
