const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({

    sender: String,
    receiver: String,
    text: String,
    image: String,
    time: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Message", messageSchema);