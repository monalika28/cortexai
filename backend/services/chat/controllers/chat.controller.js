import Conversation from "../models/coversation.model.js";
import Message from "../models/message.model.js";

export const createConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    console.log("userId", userId);
    const conversation = await Conversation.create({
      userId: userId,
    });

    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({ message: `create conversation error ${error}` });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    console.log("userId", userId);
    const conversations = await Conversation.find({
      userId: userId,
    }).sort({ updatedAt: -1 });

    return res.status(200).json(conversations);
  } catch (error) {
    return res.status(500).json({ message: `get conversation error ${error}` });
  }
};

export const updateConversation = async (req, res) => {
  try {
    const { id, title } = req.body;
    const conversation = await Conversation.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    );

    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({ message: `update conversation error ${error}` });
  }
};

export const saveMessage = async (req, res) => {
  try {
    const { conversationId, role, content, images, artifacts } = req.body;
    const message = await Message.create({
      conversationId,
      content,
      role,
      images,
      artifacts,
    });
    return res.status(200).json(message);
  } catch (error) {
    return res.status(500).json({ message: `save message error ${error}` });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: `get messages error ${error}` });
  }
};

// Chat delete karne ke liye
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.headers["x-user-id"];

    const conversation = await Conversation.findOneAndDelete({
      _id: chatId,
      ...(userId && { userId }),
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    // Us conversation ke saare messages bhi database se delete karein
    await Message.deleteMany({ conversationId: chatId });

    return res.status(200).json({ success: true, message: "Chat deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: `delete chat error: ${error.message}` });
  }
};

// Chat rename karne ke liye
export const renameChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;
    const userId = req.headers["x-user-id"];

    const conversation = await Conversation.findOneAndUpdate(
      { _id: chatId, ...(userId && { userId }) },
      { title },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    return res.status(200).json({ success: true, conversation });
  } catch (error) {
    return res.status(500).json({ success: false, message: `rename chat error: ${error.message}` });
  }
};