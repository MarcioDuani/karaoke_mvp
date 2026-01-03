const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

/*
  Estrutura:
  parties = {
    ABC123: {
      name: "Minha Festa",
      queue: [
        {
          videoId,
          title,
          singer,
          thumbnail
        }
      ]
    }
  }
*/
const parties = {};

// Gera ID curto para a festa
function generateId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on("connection", socket => {
  console.log("🟢 Usuário conectado");

  // Criar festa
  socket.on("createParty", partyName => {
    const id = generateId();

    parties[id] = {
      name: partyName,
      queue: []
    };

    socket.emit("partyCreated", {
      id,
      name: partyName
    });

    console.log(`🎉 Festa criada: ${partyName} (${id})`);
  });

  // Obter informações da festa
  socket.on("getParty", partyId => {
    if (parties[partyId]) {
      socket.emit("partyInfo", parties[partyId]);
    }
  });

  // Entrar na festa (convidado ou admin)
  socket.on("joinParty", partyId => {
    if (!parties[partyId]) return;

    socket.join(partyId);

    // Envia a fila atual
    socket.emit("queueUpdate", parties[partyId].queue);
  });

  // Adicionar música à fila (PADRONIZADO)
  socket.on("addSong", data => {
    const { partyId, videoId, title, singer, thumbnail } = data;

    if (!parties[partyId]) return;
    if (!videoId) return;

    const song = {
      videoId,
      title: title || "Sem título",
      singer: singer || "Desconhecido",
      thumbnail: thumbnail || ""
    };

    parties[partyId].queue.push(song);

    console.log(`🎵 Música adicionada na festa ${partyId}:`, song);

    io.to(partyId).emit("queueUpdate", parties[partyId].queue);
  });

  // Avançar para a próxima música
  socket.on("nextSong", partyId => {
    if (!parties[partyId]) return;

    parties[partyId].queue.shift();

    io.to(partyId).emit("queueUpdate", parties[partyId].queue);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Usuário desconectado");
  });
});

server.listen(3000, () => {
  console.log("🎤 Karaoke rodando em http://localhost:3000");
});
