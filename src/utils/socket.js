const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Chat = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");

const JWT_SECRET = process.env.JWT_SECRET;
const ALLOWED_ORIGIN = "http://localhost:5173";

const parseCookies = (cookieHeader = "") =>
  Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => {
        const i = c.indexOf("=");
        return [c.slice(0, i), decodeURIComponent(c.slice(i + 1))];
      }),
  );

const getRoomId = (a, b) => [String(a), String(b)].sort().join("_");

const areConnected = async (userIdA, userIdB) => {
  const found = await ConnectionRequest.findOne({
    status: "accepted",
    $or: [
      { fromUserId: userIdA, toUserId: userIdB },
      { fromUserId: userIdB, toUserId: userIdA },
    ],
  });
  return Boolean(found);
};

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: ALLOWED_ORIGIN, credentials: true },
  });

  io.use(async (socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      const token = cookies.token;
      if (!token) return next(new Error("Unauthorized: no token"));

      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded._id).select(
        "_id firstName lastName photoUrl",
      );
      if (!user) return next(new Error("Unauthorized: user not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Unauthorized: " + err.message));
    }
  });

  io.on("connection", (socket) => {
    const userId = String(socket.user._id);

    socket.on("joinChat", async ({ targetUserId }, ack) => {
      try {
        if (!targetUserId) throw new Error("targetUserId required");
        if (targetUserId === userId) throw new Error("Cannot chat with self");

        const allowed = await areConnected(userId, targetUserId);
        if (!allowed) throw new Error("Not connected with this user");

        const roomId = getRoomId(userId, targetUserId);
        socket.join(roomId);

        let chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId], $size: 2 },
        }).populate("messages.senderId", "firstName lastName photoUrl");

        if (!chat) {
          chat = await Chat.create({
            participants: [userId, targetUserId],
            messages: [],
          });
        }

        ack?.({ ok: true, roomId, messages: chat.messages });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    socket.on("sendMessage", async ({ targetUserId, text }, ack) => {
      try {
        const clean = (text || "").trim();
        if (!clean) throw new Error("Empty message");
        if (!targetUserId) throw new Error("targetUserId required");

        const allowed = await areConnected(userId, targetUserId);
        if (!allowed) throw new Error("Not connected with this user");

        const roomId = getRoomId(userId, targetUserId);

        let chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId], $size: 2 },
        });
        if (!chat) {
          chat = await Chat.create({
            participants: [userId, targetUserId],
            messages: [],
          });
        }

        const msg = {
          senderId: socket.user._id,
          text: clean,
        };
        chat.messages.push(msg);
        await chat.save();

        const saved = chat.messages[chat.messages.length - 1];
        const payload = {
          _id: saved._id,
          text: saved.text,
          createdAt: saved.createdAt,
          senderId: {
            _id: socket.user._id,
            firstName: socket.user.firstName,
            lastName: socket.user.lastName,
            photoUrl: socket.user.photoUrl,
          },
        };

        io.to(roomId).emit("messageReceived", payload);
        ack?.({ ok: true, message: payload });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    socket.on("typing", ({ targetUserId, isTyping }) => {
      if (!targetUserId) return;
      const roomId = getRoomId(userId, targetUserId);
      socket.to(roomId).emit("peerTyping", {
        userId,
        isTyping: Boolean(isTyping),
      });
    });

    socket.on("markRead", async ({ targetUserId }, ack) => {
      try {
        if (!targetUserId) throw new Error("targetUserId required");
        const chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId], $size: 2 },
        });
        if (chat) {
          chat.lastRead.set(String(userId), new Date());
          await chat.save();
        }
        ack?.({ ok: true });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    socket.on("leaveChat", ({ targetUserId }) => {
      if (!targetUserId) return;
      socket.leave(getRoomId(userId, targetUserId));
    });

    socket.on("disconnect", () => {});
  });

  return io;
};

module.exports = initSocket;
