const { Server } = require("socket.io");

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("task:create", (data) => {
      socket.to(data.roomId).emit("task:created", data.task);
    });

    socket.on("task:update", (data) => {
      socket.to(data.roomId).emit("task:updated", data.task);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = initializeSocket;
