import Conversation from "../../models/conversationModel.js";
import Message from "../../models/messageModel.js";
import { getReceiverSocketId, io } from "../../socket/socket.js"; // Import socket instance

/**
 * @desc    Gửi tin nhắn (Text, Ảnh, hoặc Product Card)
 * @route   POST /api/chat
 */
const sendMessage = async (req, res) => {
  try {
    const { receiverId, text, type, productData, orderData } = req.body;
    const senderId = req.user._id;

    // 1. Tìm cuộc hội thoại, nếu chưa có thì tạo mới
    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        members: [senderId, receiverId],
      });
    }

    // 2. Tạo tin nhắn mới
    const newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      text: text || "", // Có thể rỗng nếu chỉ gửi ảnh
      type: type || "text",
      productData, // Lưu thông tin thẻ sản phẩm (nếu có)
      orderData, // Lưu thông tin thẻ đơn hàng (nếu có)
    });

    // 3. Lưu song song: Message và Update Conversation
    await Promise.all([
      newMessage.save(),
      Conversation.findByIdAndUpdate(conversation._id, {
        lastMessage: {
          text: type === "text" ? text : `[Đã gửi một ${type}]`,
          sender: senderId,
          isRead: false,
        },
      }),
    ]);

    // 4. REAL-TIME: Gửi qua Socket.io ngay lập tức
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      // Bắn sự kiện "newMessage" tới đúng người nhận
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Lỗi Server" });
  }
};

/**
 * @desc    Lấy nội dung tin nhắn của 1 cuộc hội thoại
 * @route   GET /api/chat/:userToChatId
 */
const getMessages = async (req, res) => {
  try {
    const { userToChatId } = req.params;
    const senderId = req.user._id;

    const conversation = await Conversation.findOne({
      members: { $all: [senderId, userToChatId] },
    });

    if (!conversation) return res.status(200).json([]);

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 }); // Tin nhắn cũ ở trên, mới ở dưới

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Lỗi Server" });
  }
};

/**
 * @desc    Lấy danh sách những người đã chat (Sidebar bên trái)
 * @route   GET /api/chat/conversations
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      members: { $in: [userId] },
    })
      .populate("members", "username fullName avatar shop") // Lấy thông tin đối phương
      .sort({ updatedAt: -1 }); // Chat mới nhất lên đầu

    // Lọc bỏ chính mình ra khỏi danh sách members để Frontend dễ hiển thị
    const result = conversations.map((conv) => {
      const otherUser = conv.members.find(
        (member) => member._id.toString() !== userId.toString()
      );
      return {
        _id: conv._id,
        otherUser, // Chỉ trả về thông tin người kia
        lastMessage: conv.lastMessage,
        updatedAt: conv.updatedAt,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.log("Error in getConversations controller: ", error.message);
    res.status(500).json({ error: "Lỗi Server" });
  }
};

export const chatController = {
  sendMessage,
  getMessages,
  getConversations,
};
