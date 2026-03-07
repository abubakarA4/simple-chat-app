const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

io.on("connection", (socket) => {

    console.log("User connected");

    socket.on("chat message", (data) => {

        io.emit("chat message", data);

    });

    socket.on("disconnect", () => {

        console.log("User disconnected");

    });

});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});