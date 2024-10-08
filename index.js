const express = require("express");
const http = require("http");
const mineflayer = require('mineflayer');
const pvp = require('mineflayer-pvp').plugin;
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const armorManager = require('mineflayer-armor-manager');
const AutoAuth = require('mineflayer-auto-auth');
const app = express();

app.use(express.json());

// Serve a página HTML
app.get("/", (_, res) => res.sendFile(__dirname + "/index.html"));

// Escuta na porta definida pelo ambiente do Replit
app.listen(process.env.PORT, () => {
    console.log(`Servidor rodando na porta ${process.env.PORT}`);
});

// Mantenha o bot ativo a cada 4 minutos
setInterval(() => {
    http.get(`http://${process.env.PROJECT_DOMAIN}.repl.co/`);
}, 224000);

// U CAN ONLY EDIT THIS SECTION!!
function createBot() {
    const bot = mineflayer.createBot({
        host: 'Craft24hrs.aternos.me',
        version: false, // Substitua por uma versão específica se necessário
        username: 'AFK24HRS',
        port: 41262,
        plugins: [AutoAuth],
        AutoAuth: 'bot1122033'
    });

    // DONT TOUCH ANYTHING MORE!
    bot.loadPlugin(pvp);
    bot.loadPlugin(armorManager);
    bot.loadPlugin(pathfinder);

    bot.on('playerCollect', (collector, itemDrop) => {
        if (collector !== bot.entity) return;

        // Equipar espada se disponível
        setTimeout(() => {
            const sword = bot.inventory.items().find(item => item.name.includes('sword'));
            if (sword) bot.equip(sword, 'hand');
        }, 150);

        // Equipar escudo se disponível
        setTimeout(() => {
            const shield = bot.inventory.items().find(item => item.name.includes('shield'));
            if (shield) bot.equip(shield, 'off-hand');
        }, 250);
    });

    let guardPos = null;

    function guardArea(pos) {
        guardPos = pos.clone();
        if (!bot.pvp.target) {
            moveToGuardPos();
        }
    }

    function stopGuarding() {
        guardPos = null;
        bot.pvp.start();
        bot.pathfinder.setGoal(null);
    }

    function moveToGuardPos() {
        const mcData = require('minecraft-data')(bot.version);
        bot.pathfinder.setMovements(new Movements(bot, mcData));
        bot.pathfinder.setGoal(new goals.GoalBlock(guardPos.x, guardPos.y, guardPos.z));
    }

    bot.on('stoppedAttacking', () => {
        if (guardPos) {
            moveToGuardPos();
        }
    });

    bot.on('physicTick', () => {
        if (bot.pvp.target) return;
        if (bot.pathfinder.isMoving()) return;

        const entity = bot.nearestEntity();
        if (entity) {
            bot.lookAt(entity.position.offset(0, entity.height, 0));
        }
    });

    bot.on('physicTick', () => {
        if (!guardPos) return;
        const filter = e => e.type === 'mob' && e.position.distanceTo(bot.entity.position) < 16 &&
            e.mobType !== 'Armor Stand';
        const entity = bot.nearestEntity(filter);
        if (entity) {
            bot.pvp.attack(entity);
        }
    });

    bot.on('chat', (username, message) => {
        const player = bot.players[username];

        if (message === 'guard') {
            if (player) {
                bot.chat('I will!');
                guardArea(player.entity.position);
            } else {
                bot.chat("I can't see you!");
            }
        }
        if (message === 'love you') {
            bot.chat('I Love you Too Meri jaan :)');
            stopGuarding();
        }
    });

    bot.on('kicked', console.log);
    bot.on('error', console.log);
    bot.on('end', createBot);
}

// Inicializa o bot
createBot();
