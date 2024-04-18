import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import { ChatRoutes } from "./routes/chat.routes";
import MongoStore from "connect-mongo";
import { GeminiRoutes } from "./routes/gemini.routes";

const app = express();

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
      mongoUrl: process.env.MONGODB_CONNECTION_STR,
      ttl: 14 * 24 * 60 * 60,
    }),
  })
);
// !
app.use("/api/chat/", ChatRoutes);
app.use("/api/gemini/", GeminiRoutes);
app.get("/", async (req: Request, res: Response) => {
  return res.json({
    message: "Hello world",
  });
});

export { app };
