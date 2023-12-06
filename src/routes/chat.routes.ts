import express from "express";
// import upload from "../middlewares/multer.middleware";
import {
  initChatHandler,
  makeQueryHandler,
} from "../controllers/chat.controllers";
import upload from "../middlewares/multer.middleware";

const router = express.Router();

router.post("/init", initChatHandler);
router.post("/ask", makeQueryHandler);

export { router as ChatRoutes };
