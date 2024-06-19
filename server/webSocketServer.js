const logger = require("./helpers/logger");
const socketIo = require("socket.io");
const config = require("../config");
const serverConfig = require("./serverConfig");

let users = [];

const userJoinOrLeftCallBack = (socket, userData, io) => {
  console.log("User connected with data:", userData);

  emitUserJoined(socket, userData, io);

  socket.on("disconnect", () => handleUserDisconnect(socket, userData, io));
};
const handleCurrentUserConnected = (socket, userData, io) => {
  socket.emit("connected", users);
  socket.on("disconnect", () => handleUserDisconnect(socket, userData, io));
};
const emitUserJoined = (socket, userData, io) => {
  socket.broadcast.emit("userJoined", {
    socketId: socket.id,
    username: userData.username,
    users,
  });
};

const handleUserDisconnect = (socket, userData, io) => {
  console.log("User Disconnected:", socket.id, userData);
  console.log("List before refresh:", users);

  users = users.filter((user) => user.userData.username !== userData.username);

  emitUserLeft(socket, userData, io);
  console.log(
    `User ${userData.username} disconnected. New list: ${JSON.stringify(users)}`
  );
};

const emitUserLeft = (socket, userData, io) => {
  io.emit("userLeft", {
    socketId: socket.id,
    username: userData.username,
    users,
  });
};

const startSocketIo = (io) => {
  io.on("connection", (socket) => {
    console.log(`WebSocket connected for chat room: ${socket.id}`);
    handleConnection(socket, io);
  });
};

const handleConnection = (socket, io) => {
  const { handshake } = socket;
  const { headers } = handshake;
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
      addUser(userData, socket.id);
      userJoinOrLeftCallBack(socket, userData, io);
      handleCurrentUserConnected(socket, userData, io);
    } catch (err) {
      logger.error(`Error in retrieving user data from socket.io: ${err}`);
    }
  } else {
    console.warn(
      "No user data retrieved by socket.io, disconnecting:",
      socket.id
    );
    socket.disconnect();
  }

  setupSocketListeners(socket, io);
};

const addUser = (userData, socketId) => {
  if (!users.some((user) => user.userData.username === userData.username)) {
    users = [...users, { userData, socketId }];
  }
  console.log("User data from socket.io:", userData);
  console.log("Users connected:", users);
};

const setupSocketListeners = (socket, io) => {
  socket.on("message", (data) => handleMessage(socket, data, io));
  socket.on("iceCandidate", (iceCandidate) =>
    handleIceCandidate(socket, iceCandidate)
  );
  socket.on("offer", (offer) => handleOffer(socket, offer));
  socket.on("renewOffer", (offer) => handleRenewOffer(socket, offer));
  socket.on("answer", (answer) => handleAnswer(socket, answer));
  socket.on("camTurnedOn", (data) => handleCamTurnedOn(socket,data));
  socket.on("camTurnedOff", (data) => handleCamTurnedOff(socket,data));
};

const handleMessage = (socket, data, io) => {
  console.log(`Received message from ${socket.id}: ${JSON.stringify(data)}`);
  io.emit("message", { sender: socket.id, text: data });
};

const handleIceCandidate = (socket, iceCandidate) => {
  console.log(
    `IceCandidate received from ${iceCandidate.sender} to ${iceCandidate.receiver}`,
    iceCandidate
  );
  socket.to(iceCandidate.receiver).emit("iceCandidate", iceCandidate);
};

const handleOffer = (socket, offer) => {
  console.log(
    `Received offer: ${JSON.stringify(offer)} from ${socket.id} for user ${
      offer.socketId
    }`
  );
  socket
    .to(offer.socketId)
    .emit("offer", { id: socket.id, offer: offer.offer });
};

const handleRenewOffer = (socket, offer) => {
  console.warn("Renewing offer from WebCam turned On:", offer);
  socket.broadcast.emit("offer", { id: socket.id, offer: offer });
};

const handleAnswer = (socket, answer) => {
  console.log(
    `Received answer ${JSON.stringify(answer)} from ${answer.sender} to ${
      answer.receiver
    }`
  );
  socket.to(answer.receiver).emit("answer", answer);
};

const handleCamTurnedOn = (socket, data) => {
  console.warn(`The user ${JSON.stringify(data)} turned their webcam ON`);
  socket.broadcast.emit("camTurnedOn", data);
};

const handleCamTurnedOff = (socket,data) => {
  console.warn(`The user ${JSON.stringify(data)} turned their webcam off`);
  socket.broadcast.emit("camTurnedOff", data);
};

const initIoDevServer = (server) =>
  new socketIo.Server(server, { cors: serverConfig.corsOptions });
const initIoProdServer = (server) => new socketIo.Server(server);
const io = (server) =>
  config.isDevelopment ? initIoDevServer(server) : initIoProdServer(server);

module.exports = {
  io,
  startSocketIo,
};
