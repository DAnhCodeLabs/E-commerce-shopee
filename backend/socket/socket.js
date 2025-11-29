import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"], // Cho phép Frontend truy cập
    methods: ["GET", "POST"],
  },
});

// Lưu mapping: userId -> socketId để biết gửi tin nhắn cho ai
const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }

  // Gửi danh sách user đang online cho tất cả mọi người (Optional)
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Khi user ngắt kết nối
  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
