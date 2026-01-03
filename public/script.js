const socket = io();
let partyId = null;

function createParty() {
  const name = document.getElementById("partyName").value;
  if (!name) {
    alert("Digite o nome da festa");
    return;
  }
  socket.emit("createParty", name);
}

socket.on("partyCreated", party => {
  partyId = party.id;

  // Esconde criação e mostra área da festa
  document.getElementById("create").style.display = "none";
  document.getElementById("partyArea").style.display = "block";
  document.getElementById("partyTitle").innerText = party.name;

  // 
  document.getElementById("qrcode").innerHTML = "";

// 
const ip = "192.168.0.143"; // <-- troque pelo SEU IP
const url = `http://${ip}:3000/join.html?party=${partyId}`;

new QRCode(document.getElementById("qrcode"), {
  text: url,
  width: 220,
  height: 220
});


  // Entra na sala
  socket.emit("joinParty", partyId);
});

socket.on("queueUpdate", queue => {
  document.getElementById("queue").innerHTML =
    queue.map(q => `<li>${q.name} - ${q.song}</li>`).join("");
});

function next() {
  socket.emit("nextSong", partyId);
}
