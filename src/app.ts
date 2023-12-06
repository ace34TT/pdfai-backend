import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import { ChatRoutes } from "./routes/chat.routes";

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
    secret: "your-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
    },
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
