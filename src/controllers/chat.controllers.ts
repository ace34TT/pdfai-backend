import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { model, embedding } from "../configs/openai.config";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RequestWithCustomSession } from "../schemas/schema";
import { Response } from "express";
import { ask } from "../services/langchain.services";
import { deleteFile, fetchFile } from "../helpers/file.helper";

const cache: { [key: string]: ConversationalRetrievalQAChain } = {};

export const initChatHandler = async (
  req: RequestWithCustomSession,
  res: Response
) => {
  try {
    console.log("init");
    const [document] = [req.body.document];
    const filename = (await fetchFile("doc", document)) as string;
    const loader = new PDFLoader("src/tmp/" + filename);
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
    const questions = await ask(
      "Give the 3 main question about this document",
      chain
    );
    const summary = await ask("Summarize the document.", chain);
    console.log(questions.text.split(/\r?\n/), summary.text);
    cache[req.session.id] = chain;
    deleteFile(filename);
    return res.status(200).json({
      summary: summary.text,
      questions: [...questions.text.split(/\r?\n/)],
    });
  } catch (error: any) {
    console.trace(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const makeQueryHandler = async (
  req: RequestWithCustomSession,
  res: Response
) => {
  try {
    console.log("interacting");
    const chain = cache[req.session.id];
    if (!chain)
      return res.status(403).json({ message: "chat not initialized" });
    const [question] = [req.body.question];
    const answer = await ask(question, chain);
    return res.status(200).json({ message: answer.text });
  } catch (error: any) {
    console.trace(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};
