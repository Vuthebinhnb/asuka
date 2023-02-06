"use strict";

const loading_LOAD = require('../loading.js');
//_____________________________handler require_____________________________//
const handlerCreateDB = require('../handler/createDB.js').CREATE_DATA;
const indexCommand = require('../handler/command.js').index;
const indexReply = require('../handler/reply.js').index;
const indexReaction = require('../handler/reaction.js').index;
const indexEvent = require('../handler/event.js').index;
const langData = require('../language_scripts/change.js').index;
const temp = [];
temp[0] = 'presence';
temp[1] = 'typ';
temp[2] = 'read_receipt';

function onListen({ api, global, Config, logger, timeStart, getText }) {
    try {
        //_____________________________CREATE THREADS/USERS_____________________________//
        require('./controllers/login.js').login({ global, logger, getText })
        const Threads = require('./controllers/threads.js')({ api, global, logger, getText });
        const Users = require('./controllers/users.js')({ api, global, logger, getText });
        //____________________________LOADING COMMAND, EVENT____________________________//
        loading_LOAD.database({ global, Config, logger, getText, timeStart });
        loading_LOAD.commands({ global, Config, logger, getText, Threads, Users });
        loading_LOAD.events({ global, Config, logger, getText, Threads, Users });
        logger.log('IDFB: ' + api.getCurrentUserID() + '\n', Config['NAME']);
        if (Config.DATABASE.type == 'local') {
            logger.log('\x1b[1;37m' + getText('INFO_DONE') + '\x1b[37m', 'info status');
            logger.log(`====== ${Date.now() - timeStart}ms ======`, 'loader');
        } else {
            logger.log('\x1b[1;36m' + getText('CHOOSE_DATABASE'), 'MONGODB');
        }

        return (error, event) => {
            const message = require('../handler/message.js').index({ event, api });
            if (error) return logger.error(getText('HANDLER_ERROR', error.error), 'handlerEvent');
            if (temp.indexOf(event.type) == 0) return;

            const obj = {};
            obj.global = global;
            obj.api = api;
            obj.event = event;
            obj.Config = Config;
            obj.logger = logger;
            obj.Threads = Threads;
            obj.Users = Users;
            obj.message = message;
            obj.getText = getText;

            handlerCreateDB(obj);
            langData(obj);
            indexEvent(obj);
            switch (event.type) {
                case "message":
                case "message_reply":
                    indexCommand(obj);
                    indexReply(obj);
                case "message_reaction":
                    indexReaction(obj);
                case "message_unsend":
                case "event":
                    break;
                default:
                    break;
            }
        }
    } catch (err) {
        return logger.error(getText('HANDLER_ERROR', err), 'handlerEvent');
    }
}

module.exports = {
    onListen
}