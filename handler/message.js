'use strict';

function index({ event, api }) {
    function send(text, callback) {
        if (callback && typeof callback == "function") return api.sendMessage(text, callback);
        else return api.sendMessage(text, event.threadID);
    }

    function reply(text, callback) {
        if (callback && typeof callback == "function") return api.sendMessage(text, event.threadID, callback, event.messageID);
        else return api.sendMessage(text, event.threadID, event.messageID);
    }

    function unsend(messageID, callback) {
        if (callback && typeof callback == "function") return api.unsendMessage(messageID, callback);
        else return api.unsendMessage(messageID);
    }

    function reaction(emoji, messageID) {
        return api.setMessageReaction(emoji, function() {}, true);
    }
    return {
        send,
        reply,
        unsend,
        reaction
    }
}
module.exports = {
    index
}