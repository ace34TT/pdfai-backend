import { Response } from "express";
import { RequestWithCustomSession } from "../schemas/schema";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { ask, init } from "../services/gemini.services";
import { ContentEmbedding } from "@google/generative-ai";
import { deleteFile, fetchFile } from "../helpers/file.helper";
import { extractQuestions } from "../helpers/string.helper";
const cache: {
  [key: string]: {
    chain: ConversationalRetrievalQAChain | null;
    dataFrame: {
      Embeddings: ContentEmbedding;
      text: string;
      title: string;
    }[];
  };
} = {};

export const initChatHandler = async (
  req: RequestWithCustomSession,
  res: Response
) => {
  const [document] = [req.body.document];
  const filename = (await fetchFile("doc", document)) as string;
  try {
    const documentData = await init(filename);
    cache[req.session.id] = {
      chain: null,
      dataFrame: documentData.dataFrame,
    };
    const summary = await ask(
      documentData.dataFrame,
      "Summarize this document",
      documentData.fullText
    );
    let questions: any = await ask(
      documentData.dataFrame,
      "Suggest 3 questions about this document"
    );
    deleteFile(filename);
    console.log(questions);
    questions = questions.replace(/^\s*\n/gm, "");
    questions = questions.split(/\r?\n/) as string[];
    console.log("--------");
    console.log(questions);
    //
    console.log("--------");
    if (questions.length === 4) questions.shift();
    console.log(questions);
    return res.status(200).json({
      sessionId: req.session.id,
      summary: summary,
      questions: questions,
    });
  } catch (error: any) {
    if (req.file) deleteFile(filename);
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
    const documentData = cache[req.body.sessionId];
    if (!documentData)
      return res.status(403).json({ message: "chat not initialized" });
    const [question] = [req.body.question];
    const answer = await ask(documentData.dataFrame, question);
    return res.status(200).json({ message: answer });
  } catch (error: any) {
    console.trace(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};
