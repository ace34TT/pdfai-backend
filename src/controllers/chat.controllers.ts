import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { model, embedding } from "../configs/openai.config";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RequestWithCustomSession } from "../schemas/schema";
import { Response } from "express";
import { ask } from "../services/langchain.services";
import { deleteFile, fetchFile } from "../helpers/file.helper";
import path from "path";
// import Session from "../models/session.model";

const tempDirectory = path.resolve(__dirname, "../tmp/");

const cache: { [key: string]: ConversationalRetrievalQAChain } = {};

export const initChatHandler = async (
  req: RequestWithCustomSession,
  res: Response
) => {
  try {
    console.log("init");
    const [document] = [req.body.document];
    const filename = (await fetchFile("doc", document)) as string;
    console.log("file fetched successfully", filename);
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
    const questions = await ask(
      "Give the 3 main question about this document",
      chain
    );
    const summary = await ask("Summarize the document.", chain);
    // const sessionDoc = new Session({ sessionId: req.session.id });
    // await sessionDoc.save();
    cache[req.session.id] = chain;
    deleteFile(filename);
    return res.status(200).json({
      sessionId: req.session.id,
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
    // console.log("interacting", req.body.sessionId);
    // const sessionDoc = await Session.findById(req.body.sessionId);
    // if (!sessionDoc)
    //   return res.status(403).json({ message: "chat not initialized" });
    // console.log("found doc : ", sessionDoc.sessionId);
    const chain = cache[req.body.sessionId];
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
