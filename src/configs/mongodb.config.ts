import mongoose from "mongoose";

mongoose.connect(
  "mongodb+srv://firebaseshift:WxfwN3QAP0WtNDOr@pdfai.imrvii4.mongodb.net/?retryWrites=true&w=majority",
  {}
);

export { mongoose };
