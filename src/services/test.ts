import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAI } from "langchain/llms/openai";
import { loadQAChain } from "langchain/chains";
import { Document } from "langchain/document";

let llm = new OpenAI();
let chain = loadQAChain(llm, {});

async function extractTextFromPdf() {
  try {
    const loader = new PDFLoader("./path_to_your_pdf.pdf");
    const docs = await loader.load();
    return docs;
  } catch (error) {
    console.error(error);
    return false;
  }
}
async function generateAndStoreEmbeddings(docs: any) {
  try {
    const vectorStore = await HNSWLib.fromDocuments(
      docs,
      new OpenAIEmbeddings({
        openAIApiKey: "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",
      })
    );
    vectorStore.save("embeddings");
    console.log("embeddings created");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
async function query_text(question: string) {
  const sanitizedQuestion = question.trim().replace("\n", " ");
  const response = await chain.call({
    question: sanitizedQuestion,
    chat_history: [],
  });
}
export const test = async () => {
  const docs = await extractTextFromPdf();
  const embeddings = await generateAndStoreEmbeddings(docs);
  const question = "Your question here";
  const answer = query_text(question);
  console.log(answer);
};
