"use strict";

function index({ global, api, event, Config, logger, Threads, Users }) {
    try {
        //const { type, logMessageData, logMessageType, logMessageBody } = event;
        // scripts/event
        for (var RunEvent of global.events) {
            RunEvent.onMessage({ global, api, event, Config, logger, Threads, Users });
        }
        // handler/event
        for (var i = 0; i < global.scripts.length; i++) {
            var RunCommand = global.scripts[i];
            if (RunCommand.onEvent) {
                RunCommand.onEvent({ global, api, event, Config, logger, Threads, Users });
            }
        }
    } catch (err) {
        return logger.error(err, 'handler event');
    }
}

module.exports = {
    index
}