const socket = io();

const params = new URLSearchParams(window.location.search);
const partyId = params.get("party");
const userName = params.get("name");

async function buscar() {
  const term = document.getElementById("search").value;
  if (!term) return;

  const query = `${term} karaoke`;
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "🔍 Buscando...";

  // Simples MVP: usuário cola o link (controlado)
  setTimeout(() => {
    resultsDiv.innerHTML = `
      <div class="result">
        <p>🔗 Abra os resultados do YouTube:</p>
        <a href="${searchUrl}" target="_blank">${searchUrl}</a>
        <p>Depois cole o link do vídeo aqui:</p>
        <input id="videoLink" placeholder="https://www.youtube.com/watch?v=...">
        <button onclick="adicionar()">➕ Adicionar à fila</button>
      </div>
    `;
  }, 500);
}

function adicionar() {
  const link = document.getElementById("videoLink").value;
  if (!link) return alert("Cole o link do vídeo");

  const match = link.match(/v=([^&]+)/);
  if (!match) return alert("Link inválido");

  const videoId = match[1];

  socket.emit("addToQueue", {
    partyId,
    videoId,
    title: "Karaokê selecionado",
    singer: userName,
    thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
  });

  alert("🎶 Música adicionada à fila!");
}
