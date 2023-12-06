import { OpenAI } from "langchain/llms/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

require("dotenv").config();

const apiKey = process.env["OPENAI_API_KEY"];

const model = new OpenAI({
  openAIApiKey: apiKey,
  modelName: "gpt-3.5-turbo",
  temperature: 0.2,
});
const embedding = new OpenAIEmbeddings({
  openAIApiKey: apiKey,
  modelName: "text-embedding-ada-002",
});
export { model, embedding };
