const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Message = require("./message");
const User = require("./User");

// MongoDB Atlas connection
mongoose.connect("mongodb://Abbu:abbu12345@ac-ctpa3sj-shard-00-00.taror55.mongodb.net:27017,ac-ctpa3sj-shard-00-01.taror55.mongodb.net:27017,ac-ctpa3sj-shard-00-02.taror55.mongodb.net:27017/?ssl=true&replicaSet=atlas-58ifnq-shard-0&authSource=admin&appName=Cluster0")
    .then(() => {
        console.log("MongoDB Atlas connected");
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err);
    });

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));
app.use(express.json());

/* SIGNUP ROUTE */
app.post("/signup", async (req, res) => {

    const { username, password } = req.body;

    const user = new User({
        username: username,
        password: password
    });

    await user.save();

    res.send("User created");

});

/* LOGIN ROUTE */
app.post("/login", async (req, res) => {

    const { username, password } = req.body;

    const user = await User.findOne({
        username: username,
        password: password
    });

    if (user) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }

});

let onlineUsers = {};

/* SOCKET CONNECTION */
io.on("connection", (socket) => {

    console.log("User connected");

    socket.on("typing", (username) => {
        socket.broadcast.emit("typing", username);
    });

    socket.on("stop typing", () => {
        socket.broadcast.emit("stop typing");
    });

    /* MESSAGE SEEN SYSTEM */
    socket.on("message seen", (msgId) => {
        io.emit("message seen", msgId);
    });

    // Load old messages
    Message.find().sort({ time: 1 }).then(messages => {
        socket.emit("load messages", messages);
    });

    /* USER JOIN */
    socket.on("user joined", (username) => {

        socket.username = username;

        onlineUsers[username] = socket.id;

        io.emit("online users", Object.keys(onlineUsers));

    });

    /* RECEIVE MESSAGE */
    socket.on("chat message", async (data) => {

        const message = new Message({
            sender: data.sender,
            receiver: data.receiver,
            text: data.text,
            image: data.image
        });

        await message.save();

        const receiverSocket = onlineUsers[data.receiver];

        if (receiverSocket) {
            io.to(receiverSocket).emit("chat message", data);
        }

        socket.emit("chat message", data);

    });

    /* USER DISCONNECT */
    socket.on("disconnect", () => {

        if (socket.username) {
            delete onlineUsers[socket.username];
        }

        io.emit("online users", Object.keys(onlineUsers));

        console.log("User disconnected");

    });

});

/* SERVER START */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});