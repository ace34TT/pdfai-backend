import express from "express";
import {
  initChatHandler,
  makeQueryHandler,
} from "../controllers/gemini.controllers";

const router = express.Router();

router.post("/init", initChatHandler);
router.post("/ask", makeQueryHandler);

export { router as GeminiRoutes };
