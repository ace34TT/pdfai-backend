import express from "express";
import {
  initChatHandler,
  makeQueryHandler,
} from "../controllers/gemini.controllers";
import upload from "../middlewares/multer.middleware";

const router = express.Router();

router.post("/init", initChatHandler);
router.post("/ask", makeQueryHandler);

export { router as GeminiRoutes };
