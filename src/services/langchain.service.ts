import { OpenAI } from "langchain/llms/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { CONDENSE_PROMPT, QA_PROMPT } from "./data";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export const generateDocsSvc = async () => {
  const directoryLoader = new DirectoryLoader("src/tmp/", {
    ".pdf": (path) => new PDFLoader(path),
  });
  const rawDocs = await directoryLoader.load();
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const docs = await textSplitter.splitDocuments(rawDocs);
  return docs;
};
export const makeChainSvc = (vectorStore: any) => {
  const model = new OpenAI({
    temperature: 0.2,
    modelName: "gpt-3.5-turbo",
  });
  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(),
    {
      qaTemplate: QA_PROMPT,
      questionGeneratorTemplate: CONDENSE_PROMPT,
      returnSourceDocuments: true,
    }
  );
  return chain;
};
