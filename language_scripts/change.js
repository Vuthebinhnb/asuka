'use strict';

function index({ global, api, event, message, Config, logger, getText, Threads, Users }) {
    const getTextThreadID = (Threads.getData(event.threadID)).language || Config['LANGUAGE_SCRIPTS'];
    return getTextThreadID;
}
module.exports = {
    index
}