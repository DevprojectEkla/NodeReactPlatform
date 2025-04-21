const logger = require('./helpers/logger');
const fs = require('fs');
const socketIo = require('socket.io');
const config = require('../config');
const serverConfig = require('./serverConfig');
const { RTCPeerConnection, RTCSessionDescription } = require('@roamhq/wrtc');
const { RTCVideoSource } = require('@roamhq/wrtc').nonstandard;

const { spawn } = require('child_process');
const { buildConfig } = require('./helpers/manipulateData');
let users = [];

const userJoinOrLeftCallBack = (socket, userData, io) => {
  console.log('User connected with data:', userData);

  emitUserJoined(socket, userData, io);

  socket.on('disconnect', () => handleUserDisconnect(socket, userData, io));
};
const handleCurrentUserConnected = (socket, userData, io) => {
  socket.emit('connected', users);
  socket.on('disconnect', () => handleUserDisconnect(socket, userData, io));
};

const emitUserJoined = (socket, userData) => {
  socket.broadcast.emit('userJoined', {
    socketId: socket.id,
    username: userData.username,
    users,
  });
};

const handleUserDisconnect = (socket, userData, io) => {
  console.log('User Disconnected:', socket.id, userData);
  console.log('List before refresh:', users);

  users = users.filter((user) => user.userData.username !== userData.username);

  emitUserLeft(socket, userData, io);
  console.log(
    `User ${userData.username} disconnected. New list: ${JSON.stringify(users)}`
  );
};

const emitUserLeft = (socket, userData, io) => {
  io.emit('userLeft', {
    socketId: socket.id,
    username: userData.username,
    users,
  });
};

const startSocketIo = (io) => {
  io.on('connection', (socket) => {
    console.log(`WebSocket connected for chat room: ${socket.id}`);
    handleConnection(socket, io);
  });
};

const createPeerConnection = async (socket) => {
  const peerConnection = new RTCPeerConnection(webRtcConfig);
  peerConnection.onicecandidate = (e) => {
    if (e.candidate) {
      socket.emit('server-ice-candidate', e.candidate);
    }
  };
  const source = new RTCVideoSource();
  const track = source.createTrack();
  const ffmpegProcess = startFFmpegStream(source);
  const videoSender = peerConnection.addTransceiver(track, {
    direction: 'sendonly',
  });
  return { peerConnection, videoSender, ffmpegProcess };
};

const handleConnection = async (socket, io) => {
  const { handshake } = socket;
  const { headers } = handshake;
  const clientIP = handshake.address;
  const cookie = headers.cookie;

  console.log('Client IP:', clientIP);
  console.log('Headers of the client:', headers);
  console.log('cookie from socket headers:', cookie);

  const userDataString = decodeURIComponent(cookie).split('session_data=')[1];
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
      'No user data retrieved by socket.io, disconnecting:',
      socket.id
    );
    socket.disconnect();
  }

  setupSocketListeners(socket, io);
  createPeerConnection(socket).then(({ peerConnection }) => {
    setupWebRTCNodeServer(socket, peerConnection);
  });
};

const addUser = (userData, socketId) => {
  if (!users.some((user) => user.userData.username === userData.username)) {
    users = [...users, { userData, socketId }];
  }
  console.log('User data from socket.io:', userData);
  console.log('Users connected:', users);
};

/**
 * WebRTC server here
 *
 */

function startFFmpegStream(source) {
  console.log('starting ffmpeg');
  // Expected frame size: width * height * 1.5 (YUV420P)
  const width = 640;
  const height = 480;
  const expectedByteLength = width * height * 1.5; // 460800 bytes

  let buffer = Buffer.alloc(0); // Buffer to store incomplete frames
  const ffmpeg = spawn('ffmpeg', [
    '-f',
    'avfoundation', // Input format for macOS.
    '-framerate',
    '30', // Frame rate (adjust if needed).
    '-i',
    '0', // Input device (0 = default webcam).
    '-c:v',
    'libx264', // Encode video using x264.
    '-preset',
    'ultrafast', // Minimal latency.
    '-tune',
    'zerolatency', // Zero-latency tuning for streaming.
    '-f',
    'rawvideo', // Raw video format for WebRTC.
    '-pix_fmt',
    'yuv420p', // Pixel format WebRTC expects.
    'pipe:1', // Output to stdout.
    '-vf',
    `scale=${width}:${height}`,
  ]);
  ffmpeg.stdout.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length >= expectedByteLength) {
      const frameData = buffer.subarray(0, expectedByteLength);
      buffer = buffer.subarray(expectedByteLength); // Remove processed data
      // fs.appendFileSync('frame.yuv', frameData);
      // Send complete frame to WebRTC
      source.onFrame({
        width,
        height,
        data: new Uint8Array(frameData),
      });
    }

    console.log('========= FFmpeg Output ===========');
    console.log(source, buffer.length, buffer.subarray(0, 20));
  });

  ffmpeg.stderr.on('data', (data) => {
    console.error(`FFmpeg stderr: ${data}`);
  });

  ffmpeg.on('close', (code) => {
    console.log(`FFmpeg exited with code ${code}`);
  });

  ffmpeg.on('error', (err) => {
    console.error('FFmpeg error:', err);
  });
  return ffmpeg;
}

function stopFFmpegStream(ffmpegProcess) {
  if (ffmpegProcess) {
    ffmpegProcess.kill('SIGINT'); // Gracefully stop FFmpeg
    ffmpegProcess = null;
    console.log('FFmpeg process stopped, webcam released.');
  } else {
    console.log('No FFmpeg process to stop.');
  }
}
const turnConfig = buildConfig();

const webRtcConfig = {
  iceServers: [
    { urls: turnConfig.urls.stun },
    {
      urls: turnConfig.urls.turn_ssl,
      username: 'test',
      credential: '123456',
    },

    {
      urls: turnConfig.urls.turn,
      username: 'test',
      credential: '123456',
    },
  ],
};

const setupWebRTCNodeServer = async (socket, peerConnection) => {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit('server-offer', offer);
  let ffmpegProcess = null;
  peerConnection.onconnectionstatechange = () => {
    if (
      ffmpegProcess &&
      (peerConnection.connectionState === 'disconnected' ||
        peerConnection.connectionState === 'closed' ||
        peerConnection.connectionState === 'failed')
    ) {
      stopFFmpegStream(ffmpegProcess);
    }
  };

  socket.on('server-offer', (serverOffer) => {
    handleServerOffer(socket, serverOffer, peerConnection);
  });
  socket.on('server-ice-candidate', (candidate) => {
    handleServerIceCandidate(candidate, peerConnection);
  });

  socket.on('rtc-client-answer', async (answer) => {
    if (peerConnection.signalingState !== 'stable') {
      try {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        console.log('Answer received and set on server.');
      } catch (error) {
        console.error('Error setting answer on server:', error);
      }
    }
  });
};

const handleServerOffer = async (socket, serverOffer, peerConnection) => {
  console.log(peerConnection.signalingState);

  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(serverOffer)
  );
  try {
    const answer = await peerConnection.createAnswer();
    socket.emit('rtc-server-answer', answer);
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
  } catch (err) {
    // console.log(peerConnection.connectionState);
  }
};

const handleServerIceCandidate = async (candidate, peerConnection) => {
  console.log('handling ice');
  await peerConnection.addIceCandidate(candidate);
};

const setupSocketListeners = (socket, io) => {
  socket.on('message', (data) => handleMessage(socket, data, io));
  socket.on('iceCandidate', (iceCandidate) =>
    handleIceCandidate(socket, iceCandidate)
  );
  socket.on('offer', (offer) => handleOffer(socket, offer));
  socket.on('renewOffer', (offer) => handleRenewOffer(socket, offer));
  socket.on('answer', (answer) => handleAnswer(socket, answer));
  socket.on('camTurnedOn', (data) => handleCamTurnedOn(socket, data));
  socket.on('camTurnedOff', (data) => handleCamTurnedOff(socket, data));
};

const handleMessage = (socket, data, io) => {
  console.log(`Received message from ${socket.id}: ${JSON.stringify(data)}`);
  io.emit('message', { sender: socket.id, text: data });
};

const handleIceCandidate = (socket, iceCandidate) => {
  console.log(
    `IceCandidate received from ${iceCandidate.sender} to ${iceCandidate.receiver}`,
    iceCandidate
  );
  socket.to(iceCandidate.receiver).emit('iceCandidate', iceCandidate);
};

const handleOffer = (socket, offer) => {
  console.log(
    `Received offer: ${JSON.stringify(offer)} from ${socket.id} for user ${
      offer.socketId
    }`
  );
  socket
    .to(offer.socketId)
    .emit('offer', { id: socket.id, offer: offer.offer });
};

const handleRenewOffer = (socket, offer) => {
  console.warn('Renewing offer from WebCam turned On:', offer);
  socket.broadcast.emit('offer', { id: socket.id, offer: offer });
};

const handleAnswer = (socket, answer) => {
  console.log(
    `Received answer ${JSON.stringify(answer)} from ${answer.sender} to ${
      answer.receiver
    }`
  );
  socket.to(answer.receiver).emit('answer', answer);
};

const handleCamTurnedOn = (socket, data) => {
  console.warn(`The user ${JSON.stringify(data)} turned their webcam ON`);
  socket.broadcast.emit('camTurnedOn', data);
};

const handleCamTurnedOff = (socket, data) => {
  console.warn(`The user ${JSON.stringify(data)} turned their webcam off`);
  socket.broadcast.emit('camTurnedOff', data);
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
