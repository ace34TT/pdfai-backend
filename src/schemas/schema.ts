import { Session } from "express-session";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { Request } from "express";
import { ContentEmbedding } from "@google/generative-ai";
export interface CustomSession extends Session {
  chain?: ConversationalRetrievalQAChain;
  // gemini
  dataFrame?: {
    Embeddings: ContentEmbedding;
    text: string;
    title: string;
  }[];
  fullText?: string;
}
export interface RequestWithCustomSession extends Request {
  session: CustomSession;
}
