import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import {} from "./app";
import { readPDF } from "./services/test_2";
// import { test } from "./services/test_2";
import { run } from "./services/test_3";
const main = async () => {
  // const text = await readPDF("document.pdf");
  // console.log(text);
  const loader = new PDFLoader("src/tmp/document.pdf");
  const docs = await loader.load();
  run(docs);

  //   test();
  // run();
};
main();
