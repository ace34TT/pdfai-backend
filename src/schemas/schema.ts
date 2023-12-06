import { Session } from "express-session";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { Request } from "express";
export interface CustomSession extends Session {
  chain?: ConversationalRetrievalQAChain;
}
export interface RequestWithCustomSession extends Request {
  session: CustomSession;
}
