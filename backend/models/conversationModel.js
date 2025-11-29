import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    // Lưu ID của 2 người tham gia (1 User, 1 Shop)
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
      },
    ],
    // Lưu tin nhắn cuối cùng để hiển thị preview bên ngoài danh sách
    lastMessage: {
      text: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
      isRead: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
