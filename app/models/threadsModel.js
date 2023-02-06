const mongoose = require("mongoose");
const { Schema } = mongoose;

const Threads = new Schema({
    id: String,
    name: String,
    emoji: String,
    prefix: String,
    language: String,
    members: Object,
    approvalMode: String,
    status: String,
    banned: Object,
    data: Object,
    avatar: String
}, {
    timestamps: true
});

module.exports = mongoose.model("threads", Threads);
