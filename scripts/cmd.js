'use strict';
module.exports = {
    config: {
        name: 'cmd',
        ver: '1.0.0',
        role: 2,
        author: ['Lawer Team'],
        description: 'Quản lý / Vận hành các lệnh tập lệnh bot',
        location: __filename,
        timestamps: 0
    },
    onMessage: out
};
async function out({ event, api, global, Config, logger, Threads, Users, args, body, is }) {
    const { readdirSync, readFileSync, writeFileSync, existsSync, copySync } = require('fs-extra');
    switch (args[0]) {
        case "load":
        case "-l":
        case "l":
            {
                if (!args[1]) {
                    var success = [];
                    var error = [];
                    const commandFile = readdirSync(__dirname).filter(item => item.endsWith(".js") && !item.includes("example"));
                    for (var file of commandFile) {
                        var command = require(__dirname + '/' + file);
                        var nameCmd = command.config.name;
                        try {
                            delete require.cache[require.resolve(`${__dirname}/${file}`)];
                            global.scripts.splice(global.scripts.findIndex(i => i.config.name == nameCmd), 1);
                            if (!global.scripts.some(i => i.config.name == nameCmd)) {
                                global.scripts.push(command);
                                if (command.onLoad) {
                                    command.onLoad({ global, Config, logger });
                                }
                                success.push(command);
                            }
                        } catch (err) {
                            error.push({ name: nameCmd, error: err });
                        }
                    }
                    if (error.length != 0) {
                        var msg = '';
                        var dem = 0;
                        for (var i of error) {
                            dem++;
                            msg += dem + '. ' + i.name + ': ' + i.error + '\n';
                        }
                        return api.sendMessage('Load success ' + success.length + ' command.\n» Have ' + error.length + ' error command «\n' + msg, event.threadID, event.messageID);
                    } else {
                        return api.sendMessage('Load success ' + success.length + ' command.', event.threadID, event.messageID);
                    }
                } else {
                    try {
                        var command = require(__dirname + '/' + args[1] + '.js');
                        var nameCmd = command.config.name;
                        delete require.cache[require.resolve(`${__dirname}/${args[1]}`)];
                        global.scripts.splice(global.scripts.findIndex(i => i.config.name == nameCmd), 1);
                        if (!global.scripts.some(i => i.config.name == nameCmd)) {
                            global.scripts.push(command);
                            if (command.onLoad) {
                                command.onLoad({ global, Config, logger });
                            }
                            return api.sendMessage('Load command `' + args[1] + '` success.', event.threadID, event.messageID);
                        }
                    } catch (err) {
                        return api.sendMessage('Error loading command: `' + args[1] + '`.\n' + 'Error: Cannot find module.', event.threadID, event.messageID);
                    }
                }
            }
        case "unload":
        case "-ul":
        case "ul":
            {
                if (!args[1]) {
                    var success = [];
                    const commandFile = readdirSync(__dirname).filter(item => item.endsWith(".js") && !item.includes("example") && !item.includes(is.config.name));
                    for (var file of commandFile) {
                        var command = require(__dirname + '/' + file);
                        var nameCmd = command.config.name;
                        delete require.cache[require.resolve(`${__dirname}/${file}`)];
                        global.scripts.splice(global.scripts.findIndex(i => i.config.name == nameCmd), 1);
                        if (!global.scripts.some(i => i.config.name == nameCmd)) {
                            success.push(command);
                        }
                    }
                    return api.sendMessage('Unload ' + success.length + ' command success.', event.threadID, event.messageID);
                } else {
                    try {
                        var command = require(__dirname + '/' + args[1]);
                        var nameCmd = command.config.name;
                        delete require.cache[require.resolve(`${__dirname}/${args[1]}`)];
                        global.scripts.splice(global.scripts.findIndex(i => i.config.name == nameCmd), 1);
                        if (!global.scripts.some(i => i.config.name == nameCmd)) {
                            return api.sendMessage('Unload command `' + args[1] + '` success.', event.threadID, event.messageID);
                        }
                    } catch (err) {
                        return api.sendMessage('Error unloading command: `' + args[1] + '`.\n' + 'Error: Cannot find module.', event.threadID, event.messageID);
                    }
                }
            }
        case "count":
        case "-c":
            {
                return api.sendMessage('Show at there ' + global.scripts.length + ' command is running on this bot.', event.threadID, event.messageID);
            }
        default:
            {
                return;
            }
    }
}