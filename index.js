const express = require("express");
const http = require("http");
const mineflayer = require("mineflayer");
const pvp = require("mineflayer-pvp").plugin;
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const armorManager = require("mineflayer-armor-manager");
const AutoAuth = require("mineflayer-auto-auth");
const app = express();

app.use(express.json());

app.get("/", (_, res) => res.sendFile(__dirname + "/index.html"));
app.listen(process.env.PORT || 10000); // Defina uma porta padrão se não estiver no ambiente de produção

setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.repl.co/`);
}, 224000);

function createBot() {
  const bot = mineflayer.createBot({
    host: "Craft24hrs.aternos.me",
    version: false,
    username: "AFK24HRS",
    port: 41262,
    plugins: [AutoAuth],
    AutoAuth: "bot1122033"
  });

  bot.loadPlugin(pvp);
  bot.loadPlugin(armorManager);
  bot.loadPlugin(pathfinder);

  // Gerenciamento de erros e reconexão
  bot.on("kicked", (reason) => {
    console.log(`Kicked for: ${reason}`);
    setTimeout(createBot, 5000); // Aguardar 5 segundos antes de reconectar
  });

  bot.on("error", (err) => {
    console.error(`Error: ${err}`);
    setTimeout(createBot, 5000); // Aguardar 5 segundos antes de reconectar
  });

  bot.on("end", () => {
    console.log("Bot disconnected, attempting to reconnect...");
    setTimeout(createBot, 5000); // Aguardar 5 segundos antes de reconectar
  });

  // O resto do seu código de bot...
  bot.on("playerCollect", (collector, itemDrop) => {
    if (collector !== bot.entity) return;

    setTimeout(() => {
      const sword = bot.inventory.items().find(item => item.name.includes("sword"));
      if (sword) bot.equip(sword, "hand");
    }, 150);
  });

  bot.on("chat", (username, message) => {
    if (message === "guard") {
      const player = bot.players[username];
      if (player) {
        guardArea(player.entity.position);
        bot.chat("I will!");
      }
    }
    if (message === "love you") {
      bot.chat("I Love you Too Meri jaan :)");
      stopGuarding();
    }
  });

  // Implemente os outros eventos e funcionalidades aqui...
}

createBot();
