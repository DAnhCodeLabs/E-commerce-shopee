import express from "express";
import authorizeRole from "../middleware/authorizeRole.js";
import { chatController } from "../controllers/chat/chat.controller.js";

const chatRouter = express.Router();

// Yêu cầu đăng nhập
chatRouter.use(authorizeRole(["user", "seller", "admin"]));

// Gửi tin nhắn
chatRouter.post("/send", chatController.sendMessage);

// Lấy danh sách hội thoại (Sidebar)
chatRouter.get("/conversations", chatController.getConversations);

// Lấy nội dung tin nhắn với 1 người cụ thể
chatRouter.get("/:userToChatId", chatController.getMessages);

export default chatRouter;
