import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import { ChatRoutes } from "./routes/chat.routes";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";

const app = express();
mongoose.connect(
  "mongodb+srv://firebaseshift:WxfwN3QAP0WtNDOr@pdfai.imrvii4.mongodb.net/?retryWrites=true&w=majority",
  {}
);

app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
app.use(bodyParser.json());
app.use(
  session({
    secret: "abilityToFly",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
    },
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://firebaseshift:WxfwN3QAP0WtNDOr@pdfai.imrvii4.mongodb.net/?retryWrites=true&w=majority",
      ttl: 14 * 24 * 60 * 60,
    }),
  })
);
// !
app.use("/api/chat/", ChatRoutes);

app.get("/", async (req: Request, res: Response) => {
  return res.json({
    message: "Hello world",
  });
});

export { app };
