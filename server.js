const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const os = require("os");


console.log(">>> server.js começou a executar");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

// ⚠️ depois colocamos em .env
const YOUTUBE_API_KEY = "AIzaSyCzp7_Fm6kBDT6Kn_mAd3oYrJCyCIiyqNI";

const parties = {};

function getLocalIP() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }

  return "localhost";
}

const SERVER_IP = getLocalIP();

console.log(">>> IP do servidor:", SERVER_IP);

// =========================
// ROTAS HTTP (API)
// =========================
app.get("/api/search", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "Busca vazia" });
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(
      query + " karaoke"
    )}&key=${YOUTUBE_API_KEY}`;

    // fetch NATIVO do Node 22
    const response = await fetch(url);
    const data = await response.json();

    // pega os IDs retornados na busca
const videoIds = data.items.map(item => item.id.videoId).join(",");

// chama a API de vídeos para validar embed
const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=status&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
const detailsResponse = await fetch(detailsUrl);
const detailsData = await detailsResponse.json();

// cria um mapa id -> embeddable
const embeddableMap = {};
detailsData.items.forEach(v => {
  embeddableMap[v.id] = v.status.embeddable;
});

// retorna APENAS vídeos embedáveis
const videos = data.items
  .filter(item => embeddableMap[item.id.videoId])
  .map(item => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.medium.url
  }));

 res.json(videos);
  } catch (err) {
    console.error("Erro API YouTube:", err);
    res.status(500).json({ error: "Erro ao buscar vídeos" });
  }

   
});

// =========================
// SOCKET.IO
// =========================
function generateId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

app.get("/api/server-ip", (req, res) => {
  res.json({ ip: SERVER_IP });
});

io.on("connection", socket => {

 socket.on("createParty", partyName => {
  const id = generateId();

  parties[id] = {
    name: partyName,
    queue: []
  };

  // resposta para quem criou (QR)
  socket.emit("partyCreated", { id, name: partyName });

  // 🔥 AVISA TODOS OS HOSTS (Electron)
  io.emit("partyCreatedGlobal", { id });
});



  socket.on("joinParty", partyId => {
    if (!parties[partyId]) return;
    socket.join(partyId);
    socket.emit("queueUpdate", parties[partyId].queue);
  });

  socket.on("addSong", ({ partyId, videoId, title, singer, thumbnail }) => {
    if (!parties[partyId]) return;

    parties[partyId].queue.push({
      videoId,
      title,
      singer,
      thumbnail
    });

    io.to(partyId).emit("queueUpdate", parties[partyId].queue);
  });

  socket.on("nextSong", partyId => {
    if (!parties[partyId]) return;
    parties[partyId].queue.shift();
    io.to(partyId).emit("queueUpdate", parties[partyId].queue);
  });

});

// =========================
// START SERVER (ISSO FALTAVA)
// =========================
console.log(">>> prestes a iniciar o servidor");

server.listen(3000, () => {
  console.log("🎤 Karaoke rodando em http://localhost:3000");
});
