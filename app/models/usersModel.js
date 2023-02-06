const mongoose = require("mongoose");
const { Schema } = mongoose;

const Users = new Schema({
    id: String,
    name: String,
    firstName: String,
    vanity: String,
    gender: Number,
    profileUrl: String,
    money: Number,
    exp: Number,
    banned: Object,
    data: Object,
    avatar: String
}, {
    timestamps: true
});

module.exports = mongoose.model("users", Users);