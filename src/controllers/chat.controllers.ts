import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { embedding } from "../configs/openai.config";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RequestWithCustomSession } from "../schemas/schema";
import { Response } from "express";
import { ask, init } from "../services/langchain.services";
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
    const chain = await init(filename);
    const questions = await ask(
      "Give the 3 main question about this document",
      chain
    );
    const summary = await ask("Summarize the document.", chain);
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
