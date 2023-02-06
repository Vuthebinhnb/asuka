"use strict";
const config = {
    name: 'uptime',
    role: 0,
    version: '1.0.0',
    author: 'DuyVuong'
};

function onMessage({ api, event, global, Threads }) {
    let time = process.uptime();
    var hours = Math.floor(time / (60 * 60));
    var minutes = Math.floor((time % (60 * 60)) / 60);
    var seconds = Math.floor(time % 60);
    var hours_1 = (hours < 10) ? '0' + hours : hours;
    var minutes_1 = (minutes < 10) ? '0' + minutes : minutes;
    var seconds_1 = (seconds < 10) ? '0' + seconds : seconds;
    return api.sendMessage('[ ' + hours_1 + ':' + minutes_1 + ':' + seconds_1 + ' ]\n[ 🎭Lawer Pr0ject🎭 ]', event.threadID, event.messageID);
}

module.exports = {
    config,
    onMessage
}