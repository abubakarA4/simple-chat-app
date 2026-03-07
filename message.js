const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    user: String,
    text: String,
    time: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Message", MessageSchema);