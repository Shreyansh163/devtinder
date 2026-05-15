const express = require("express");
const { userAuth } = require("../middleware/auth");
const Chat = require("../models/chat");

const chatRouter = express.Router();

chatRouter.get("/user/chats", userAuth, async (req, res) => {
  try {
    const me = req.user._id;
    const chats = await Chat.find({ participants: me })
      .populate("participants", "firstName lastName photoUrl")
      .lean();

    const data = chats
      .map((chat) => {
        const other = chat.participants.find(
          (p) => String(p._id) !== String(me),
        );
        if (!other) return null;

        const lastMessage = chat.messages?.[chat.messages.length - 1] || null;
        const lastReadAt = chat.lastRead?.[String(me)]
          ? new Date(chat.lastRead[String(me)])
          : new Date(0);

        const unreadCount = (chat.messages || []).filter(
          (m) =>
            String(m.senderId) !== String(me) &&
            new Date(m.createdAt) > lastReadAt,
        ).length;

        return {
          target: other,
          lastMessage: lastMessage
            ? {
                text: lastMessage.text,
                createdAt: lastMessage.createdAt,
                mine: String(lastMessage.senderId) === String(me),
              }
            : null,
          unreadCount,
          updatedAt: chat.updatedAt,
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          new Date(b.lastMessage?.createdAt || b.updatedAt) -
          new Date(a.lastMessage?.createdAt || a.updatedAt),
      );

    res.json({ data });
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

module.exports = chatRouter;
