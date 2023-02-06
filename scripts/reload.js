"use strict";
const config = {
    name: 'reload',
    role: 3,
    version: '1.0.0',
    author: 'DuyVuong',
    timestamps: 0
};

function LOAD({ global, Config, logger, getText, Threads, Users }) {
    try {
        const { commands, events } = require('../loading.js');
        global.scripts = new Array();
        global.events = new Array();
        commands({ global, Config, logger, getText, Threads, Users });
        events({ global, Config, logger, getText, Threads, Users });
        logger.load('DONE SUCCESS RELOAD SCRIPTS AND EVENTS', 'reload');
        return { fail: false };
    } catch (err) {
        logger.error(err, 'reload');
        return { fail: true, error: err };
    }
}

function onMessage({ api, event, Config, logger, global, getText, Threads, Users }) {
    try {
        let s = LOAD({ global, Config, logger, getText, Threads, Users });
        if (s.fail == false) {
            return api.sendMessage('Tải lại dữ liệu thành công!', event.threadID, event.messageID);
        } else {
            return api.sendMessage('error!', event.threadID, event.messageID);
        }
    } catch (ex) {
        return api.sendMessage(ex, event.threadID, event.messageID);
    }
}

module.exports = {
    config,
    onMessage
}