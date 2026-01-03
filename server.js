const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const parties = {};

function generateId() {
  return Math.random().toString(36).substring(2, 8);
}

io.on("connection", socket => {

  socket.on("createParty", partyName => {
    const id = generateId();
    parties[id] = {
      name: partyName,
      queue: []
    };
    socket.emit("partyCreated", { id, name: partyName });
  });

  socket.on("getParty", partyId => {
    if (parties[partyId]) {
      socket.emit("partyInfo", parties[partyId]);
    }
  });

  socket.on("joinParty", partyId => {
    if (!parties[partyId]) return;
    socket.join(partyId);
    socket.emit("queueUpdate", parties[partyId].queue);
  });

  // 🎶 EVENTO CORRETO PARA ADICIONAR MÚSICA
  socket.on("addToQueue", data => {
    const party = parties[data.partyId];
    if (!party) return;

    party.queue.push({
      videoId: data.videoId,
      title: data.title,
      singer: data.singer,
      thumbnail: data.thumbnail
    });

    io.to(data.partyId).emit("queueUpdate", party.queue);
  });

  socket.on("nextSong", partyId => {
    if (!parties[partyId]) return;
    parties[partyId].queue.shift();
    io.to(partyId).emit("queueUpdate", parties[partyId].queue);
  });

});

server.listen(3000, () => {
  console.log("🎤 Karaoke rodando em http://localhost:3000");
});
