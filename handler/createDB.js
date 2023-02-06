"use strict";

async function CREATE_DATA({ api, event, global, logger, Threads, Users }) {
    try {
        const { threadID, isGroup } = event;
        const senderID = event.senderID || event.author;

        // ——————————————/     CREATE THREAD DATA   /—————————————— //
        if (!global.allThreadData[threadID] && !isNaN(threadID) && threadID != 0) {
            try {
                await Threads.createData(threadID);
            } catch (e) { logger.error(err, "Create Threads") }
        }
        // ———————————————/     CREATE USER DATA    /——————————————— //
        if (!global.allUserData[senderID] && isGroup && !isNaN(senderID) && senderID != 0) {
            try {
                await Users.createData(senderID);
            } catch (err) { logger.error(err, "Create Users") }
        }
    } catch (e) {
        logger.error(e.stack, "HANDLE CREATE DATABASE");
    }
}

module.exports = {
    CREATE_DATA
}