import {
  ContentEmbedding,
  EmbedContentResponse,
  TaskType,
} from "@google/generative-ai";
import { embedModel, model } from "../configs/gemini.config";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import path from "path";
const tempDirectory = path.resolve(__dirname, "../tmp/");

export const embedFn = async (title: any, text: any) => {
  return (
    await embedModel.embedContent({
      title: title,
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      content: {
        parts: [
          {
            text: text,
          },
        ],
        role: "",
      },
    })
  ).embedding;
};
export const findBestPassage = (
  dataFrame: {
    Embeddings: ContentEmbedding;
    text: string;
    title: string;
  }[],
  queryEmbedding: EmbedContentResponse
) => {
  let dotProducts = dataFrame.map((item) =>
    dotProduct(item.Embeddings.values, queryEmbedding.embedding.values)
  );

  let maxIndex = dotProducts.reduce(
    (iMax, x, i, arr) => (x > arr[iMax] ? i : iMax),
    0
  );
  const passage = dataFrame[maxIndex].text;
  return passage;
};
const dotProduct = (vecA: number[], vecB: number[]) => {
  let product = 0;
  for (let i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i];
  }
  return product;
};

export const init = async (document: string) => {
  const loader = new PDFLoader(path.resolve(tempDirectory, document));
  const data = await loader.load();
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
  });
  let fullText = "";
  const docs = await textSplitter.splitDocuments(data);
  docs.forEach((item) => {
    fullText = fullText + " " + item.pageContent;
  });
  const textData = docs.map((item) => {
    return {
      text: item.pageContent,
      title: "",
    };
  });
  const dataFrame = await Promise.all(
    textData.map(async (row) => {
      return {
        ...row,
        Embeddings: await embedFn(row.title, row.text),
      };
    })
  );
  return { dataFrame, fullText };
};
export const ask = async (
  dataFrame: { Embeddings: ContentEmbedding; text: string; title: string }[],
  query: string,
  fullText?: string
) => {
  const queryEmbedding = await embedModel.embedContent({
    content: {
      parts: [{ text: query }],
      role: "",
    },
    title: "",
    taskType: TaskType.RETRIEVAL_QUERY,
  });
  const passage = fullText
    ? fullText
    : findBestPassage(dataFrame, queryEmbedding);
  const escaped = passage.replace("'", "").replace('"', "").replace("\n", " ");
  let prompt = `You are a helpful and informative bot that answers questions using text from the reference passage included below.
  Be sure to respond in a complete sentence, being comprehensive, including all relevant background information.
  However, you are talking to a non-technical audience, so be sure to break down complicated concepts and
  strike a friendly and conversational tone.
  If the passage is irrelevant to the answer, you may ignore it.
  QUESTION: '${query}'
  PASSAGE: '${escaped}'
  ANSWER:`;
  const answer = await model.generateContent(prompt);
  return answer.response.text();
};
