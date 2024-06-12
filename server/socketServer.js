const socketIo = require("socket.io");
const serverConfig = require("./serverConfig")

let users = [];

const userJoinOrLeftCallBack = (socket, userData) => {
  console.log("User connected with data:", userData);
  socket.join("chatRoom");
  io.to("chatRoom").emit("userJoined", {
    socketId: socket.id,
    username: userData.username,
    users: users,
  });
  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id, userData);
    console.log("list before refresh", users);
    users = users.filter(
      (user) => user.userData.username !== userData.username
    );
    io.to("chatRoom").emit("userLeft", {
      socketId: socket.id,
      username: userData.username,
      users: users,
    });
    console.log(
      `user ${userData.username} disconnected new list: ${JSON.stringify(
        users
      )}`
    );
  });
};

const startSocketIo = () => {
  io.on("connection", (socket) => {
    console.log(`WebSocket connected for chat room: ${socket.id}`);
    const handshake = socket.handshake;
    const headers = handshake.headers;
    const clientIP = handshake.address;
    const cookie = headers.cookie;
    console.log("Client IP:", clientIP);
    console.log("Headers of the client:", headers);
    console.log("cookie from socket headers:", cookie);

    const userDataString = decodeURIComponent(cookie).split("session_data=")[1];
    console.log(userDataString);

    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        if (
          !users.some((user) => user.userData.username === userData.username)
        ) {
          users = [...users, { userData: userData, socketId: socket.id }];
        }
        console.log("user data from socket.io", userData);
        console.log("users connected", users);
        userJoinOrLeftCallBack(socket, userData);
      } catch (err) {
        loggerModule.error(`Error in retrieving
            user data from socket.io ${err}`);
      }
    } else {
      console.warn(
        "no user data retrieved by socket.io, disconnecting:",
        socket.id
      );
      socket.disconnect();
    }
    socket.on("message", (data) => {
      console.log(`Received message from ${socket.id}: ${data}`);
      io.emit("message", { sender: socket.id, text: data });
    });
    socket.on("iceCandidate", (iceCandidate) => {
      console.log(
        `IceCandidate received from ${iceCandidate.sender}
          to ${iceCandidate.receiver}`,
        iceCandidate
      );
      socket.to(iceCandidate.receiver).emit("iceCandidate", iceCandidate);
    });
    socket.on("offer", (offer) => {
      console.log(
        `Received offer:${JSON.stringify(offer)} from ${socket.id} for user ${
          offer.socketId
        }`
      );
      socket
        .to(offer.socketId)
        .emit("offer", { id: socket.id, offer: offer.offer });
    });

    socket.on("renewOffer", (offer) => {
      console.warn("Renewing offer from WebCam turned On:", offer);
      socket.broadcast.emit("offer", { id: socket.id, offer: offer });
    });
    socket.on("answer", (answer) => {
      console.log(
        `Received answer ${JSON.stringify(answer)} from ${answer.sender} to ${
          answer.receiver
        }`
      );
      socket.to(answer.receiver).emit("answer", answer);
    });
    socket.on("camTurnedOff", (data) => {
      console.warn(`The user ${JSON.stringify(data)} turned his webcam off`);
      io.emit("camTurnedOff", data);
    });
  });
};

const initIoDevServer = () =>
  new socketIo.Server(server, { cors: serverConfig.corsOptions });
const initIoProdServer = () => new socketIo.Server(server);
const io = config.isDevelopment ? initIoDevServer() : initIoProdServer();

