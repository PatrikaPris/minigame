const CONTRACT_ADDRESS = "PASTE_DEPLOYED_ADDRESS_HERE";

const ABI = [
  "function register() payable",
  "function move(int8 dx, int8 dy)",
  "function cubes(address) view returns (bool registered, uint8 x, uint8 y, uint32 moves, uint32 crystals, uint64 lastMoveAt)",
  "function REGISTRATION_FEE() view returns (uint256)",
  "function MOVE_COOLDOWN() view returns (uint256)",
  "event Moved(address indexed player, uint8 fromX, uint8 fromY, uint8 toX, uint8 toY, bool foundCrystal)"
];

const connectBtn = document.getElementById("connectBtn");
const registerBtn = document.getElementById("registerBtn");
const addressEl = document.getElementById("address");
const gridEl = document.getElementById("grid");
const statsEl = document.getElementById("stats");
const logEl = document.getElementById("log");
const contractAddressEl = document.getElementById("contractAddress");
contractAddressEl.textContent = CONTRACT_ADDRESS;

let provider;
let signer;
let contract;
let player;
let cooldown = 15n;

function drawGrid(pos) {
  gridEl.innerHTML = "";
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const d = document.createElement("div");
      d.className = "cell";
      if (pos && pos.x === x && pos.y === y) d.classList.add("player");
      gridEl.appendChild(d);
    }
  }
}

drawGrid();

function log(msg) {
  logEl.textContent = msg;
}

async function refresh() {
  if (!contract || !player) return;
  const cube = await contract.cubes(player);
  if (!cube.registered) {
    statsEl.textContent = "Статистика: не зарегистрирован";
    drawGrid();
    return;
  }
  drawGrid({ x: Number(cube.x), y: Number(cube.y) });
  statsEl.textContent = `Статистика: x=${cube.x}, y=${cube.y}, ходов=${cube.moves}, кристаллов=${cube.crystals}, кулдаун=${cooldown}с`;
}

connectBtn.onclick = async () => {
  if (!window.ethereum) {
    log("MetaMask не найден");
    return;
  }
  if (CONTRACT_ADDRESS.includes("PASTE_")) {
    log("Сначала вставь адрес задеплоенного контракта в frontend/app.js");
    return;
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  player = await signer.getAddress();
  contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  cooldown = await contract.MOVE_COOLDOWN();

  addressEl.textContent = `Игрок: ${player.slice(0, 6)}...${player.slice(-4)}`;
  registerBtn.disabled = false;
  for (const btn of document.querySelectorAll("[data-move]")) btn.disabled = false;
  log("Кошелёк подключён. Можно играть!");
  await refresh();
};

registerBtn.onclick = async () => {
  const fee = await contract.REGISTRATION_FEE();
  const tx = await contract.register({ value: fee });
  log("Транзакция регистрации отправлена...");
  await tx.wait();
  log("Куб зарегистрирован!");
  await refresh();
};

for (const btn of document.querySelectorAll("[data-move]")) {
  btn.disabled = true;
  btn.onclick = async () => {
    const [dx, dy] = btn.dataset.move.split(",").map(Number);
    try {
      const tx = await contract.move(dx, dy);
      log("Ход отправлен...");
      await tx.wait();
      log("Ход принят в блокчейн");
      await refresh();
    } catch (err) {
      log(`Ошибка хода: ${err.shortMessage || err.message}`);
    }
  };
}
