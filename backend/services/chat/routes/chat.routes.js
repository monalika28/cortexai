import express from "express";
import { 
  createConversation, 
  getConversations, 
  getMessages, 
  saveMessage, 
  updateConversation,
  deleteChat,      // <-- Naya import yahan add karein
  renameChat       // <-- Naya import yahan add karein
} from "../controllers/chat.controller.js";

// Agar aapke project me auth middleware ka path alag hai (jaise ../middleware/auth.js), to use import karein:
// import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/create-conversation", createConversation);
router.get("/get-conversations", getConversations);
router.post("/update-conversation", updateConversation);
router.post("/save-message", saveMessage);
router.get("/get-messages/:conversationId", getMessages);

// Naye routes:
router.delete("/delete-conversation/:chatId", deleteChat);
router.patch("/rename-conversation/:chatId", renameChat);

export default router;

