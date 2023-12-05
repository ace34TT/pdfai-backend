// Import necessary modules
import { OpenAI } from "langchain/llms/openai";
import { loadQAChain } from "langchain/chains";
import fs from "fs";
import pdfParse from "pdf-parse";
import path from "path";

const tempDirectory = path.resolve(__dirname, "../tmp/");
// Function to read PDF file
export const readPDF = async (file: string) => {
  let dataBuffer = fs.readFileSync(path.resolve(tempDirectory, file));
  const data = await pdfParse(dataBuffer);
  return data.text;
};

// Initialize OpenAI
let llm = new OpenAI({
  openAIApiKey: "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",
});

// Load the QA chain
let chain = loadQAChain(llm, { type: "refine" });

// Read the PDF file

export const test = () => {
  readPDF(path.resolve(tempDirectory, "document.pdf")).then((docs) => {
    // Define your question
    let query = "what is this document about ?";
    let inputs = {
      input_documents: [docs],
      question: query,
    };
    // Run the chain with your question and documents
    chain
      .run(inputs)
      .then((answer) => console.log(answer))
      .catch((error) => console.error(error));
  });
};
