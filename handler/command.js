"use strict";

const axios = require('axios');
const stringSimilarity = require('string-similarity');
const timeStart = Date.now();
const moment = require("moment-timezone");
const time = moment.tz("Asia/Ho_Chi_minh").format("HH:mm:ss | DD/MM/YYYY");

async function index({ global, api, event, message, Config, logger, getText, Threads, Users }) {
    const { threadID, senderID, isGroup } = event;
    const {
        ADMIN,
        EXCEPTION,
        DEVMODE,
        LANGUAGE_COMMAND
    } = Config;
    const prefix = (await Threads.getData(threadID)).prefix || Config['PREFIX'];
    if (event.body.indexOf(prefix) == 0) {
        let command, args, body, role;
        command = event.body.slice(prefix.length, event.body.length).split(" ")[0];
        args = event.body
            .slice(prefix.length, event.body.length)
            .split(" ")
            .slice(1);
        body = event.body.slice(prefix.length + command.length + 1, event.body.length);
        if (command.includes("\n")) {
            args = [
                command.slice(command.indexOf("\n") + 1, command.length),
                ...args
            ];
            command = command.slice(0, command.indexOf("\n"));
        };
        ///---------------------------------/    DevMode    /-----------------------------------///
        if (DEVMODE == true) {
            args[0] == undefined ? (args[0] = '') : args[0];
            logger.log(`\x1b[32mEvent Executed: \x1b[37m${prefix}${command} ${args[0]} | \x1b[34mGroup: \x1b[37m${threadID} | \x1b[36muserID: \x1b[37m${senderID} | \x1b[35mProcess Time: \x1b[37m${Date.now() - timeStart}ms`, 'DEV MODE');
        }
        ///---------------------------------/    Command    /------------------------------------------///
        if (global.scripts.length == 0) return;
        if (!command) {
            return message.reply(getText('COMMAND_NO_SCRIPTS', prefix, 'help'));
        }
        if (!global.scripts.some(i => i.config.name == command)) {
            var allCommand = [];
            for (var s of global.scripts) {
                allCommand.push(s.config.name);
            }
            var checker = stringSimilarity.findBestMatch(command, allCommand);
            if (checker.bestMatch.rating >= 0.5) command = checker.bestMatch.target;
            else {
                return message.reply(getText('COMMAND_NO_FIND', command));
            }
        }
        ///---------------------------------/    ROLE    /------------------------------------------///
        function no_permissions(command, role_senderID) {
            var vv, cc, gs;
            // role senderID
            if (role_senderID == 0) {
                vv = getText('ROLE_0');
            } else if (role_senderID == 1) {
                vv = getText('ROLE_1');
            } else if (role_senderID == 2) {
                vv = getText('ROLE_2');
            } else if (role_senderID == 3) {
                vv = getText('ROLE_3');
            }
            gs = getText('COMMAND_NO_PERMISSIONS', prefix + command, vv);
            return gs;
        }

        if (global.scripts.findIndex(i => i.config.name == command) !== -1) {
            const run = global.scripts.find(i => i.config.name == command);
            // role
            role = null;
            api.getThreadInfo(threadID, (err, thread_get) => {
                for (var id of thread_get.adminIDs) {
                    if (id.id == senderID) {
                        role = 1;
                    }
                }
            });
            if (role == null) {
                if (ADMIN.find(c => c.toString() == senderID)) {
                    role = 2;
                } else if (EXCEPTION.find(i => i.toString() == senderID)) {
                    role = 3;
                } else {
                    role = 0;
                }
            }

            var getTextC;
            var getTextThreadID = (await Threads.getData(threadID)).language || Config['LANGUAGE_SCRIPTS'];
            if (run.language && typeof run.language == 'object' && run.language.hasOwnProperty(getTextThreadID))
                getTextC = (...values) => {
                    var lang = run.language[getTextThreadID][values[0]] || '';
                    for (var i = values.length; i > 0; i--) {
                        const expReg = RegExp('%' + i, 'g');
                        lang = lang.replace(expReg, values[i]);
                    }
                    return lang;
                };
            else getTextC = () => {};

            const obj = {};
            obj.global = global;
            obj.api = api;
            obj.event = event;
            obj.Config = Config;
            obj.logger = logger;
            obj.args = args;
            obj.body = body;
            obj.role = role;
            obj.Threads = Threads;
            obj.Users = Users;
            obj.getText = getTextC;

            if (run.config.role == 0) {
                try {
                    return run.onMessage(obj);
                } catch (errC) {
                    return message.reply(errC)
                }
            } else if (run.config.role == 1) {
                if (run.config.role < 1) {
                    return message.reply(no_permissions(run.config.name, role));
                } else {
                    try {
                        return run.onMessage(obj);
                    } catch (errC) {
                        return message.reply(errC)
                    }
                }
            } else if (run.config.role == 2) {
                if (run.config.role !== 2) {
                    return message.reply(no_permissions(run.config.name, role));
                } else {
                    try {
                        return run.onMessage(obj);
                    } catch (errC) {
                        return message.reply(errC)
                    }
                }
            } else if (run.config.role == 3) {
                if (run.config.role < 2) {
                    return message.reply(no_permissions(run.config.name, role));
                } else {
                    try {
                        return run.onMessage(obj);
                    } catch (errC) {
                        return message.reply(errC)
                    }
                }
            } else {
                return;
            }
        }
    }
}

module.exports = {
    index
}