const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from public folder
app.use(express.static("public"));

const players = {};

// New connection
io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Create player at random position
    players[socket.id] = { x: Math.random() * 800, y: Math.random() * 600 };

    // Send current players to new player
    socket.emit("currentPlayers", players);

    // Notify all other players
    socket.broadcast.emit("newPlayer", { id: socket.id, ...players[socket.id] });

    // Movement handler
    socket.on("move", (data) => {
        if (players[socket.id]) {
            players[socket.id].x += data.dx;
            players[socket.id].y += data.dy;
            io.emit("playerMoved", { id: socket.id, x: players[socket.id].x, y: players[socket.id].y });
        }
    });

    // Disconnect handler
    socket.on("disconnect", () => {
        console.log(`Player disconnected: ${socket.id}`);
        delete players[socket.id];
        io.emit("playerDisconnected", socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Daily Tally running on port ${PORT}`));
