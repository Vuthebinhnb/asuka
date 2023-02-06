"use strict";

const logger = require('./app/logger.js');
const { writeFileSync, readdirSync, existsSync } = require('fs-extra');
const envConfig = require('./envConfig.json');

function commands({ global, Config, logger, Threads, Users, getText }) {
    const listFile = readdirSync(__dirname + '/scripts').filter(item => item.endsWith(".js") && !item.includes("example"));
    for (var file of listFile) {
        try {
            const command = require(__dirname + '/scripts/' + file);
            const nameCmd = command.config.name;
            if (global.scripts.findIndex(i => i.config.name == nameCmd) < 0) {
                if (command.onLoad) {
                    command.onLoad({ global, Config, logger })
                }
                if (command.config.envConfig) {
                    envConfig.scripts.push({ name: command.config.name, configCommand: command.config.envConfig });
                    writeFileSync('./envConfig.json', JSON.stringify(envConfig, null, 4), "utf-8");
                    logger.load('Đã tải envConfig của ' + file + ' thành công', nameCmd);
                }
                global.scripts.push(command);
            } else {
                logger.warn(nameCmd + ' trùng tên với lệnh khác!');
            }
        } catch (err) {
            logger.error('Đã xảy ra lỗi khi tải ' + file + ': ' + err);
        }
    }
    logger.log(getText('COMMAND_LOAD_FILE', listFile.length), 'command');
};

function events({ gloabl, Config, logger, getText, Threads, Users }) {
    const listFile = readdirSync(__dirname + '/scripts/events').filter(item => item.endsWith(".js") && !item.includes("example"));
    for (var file of listFile) {
        try {
            const event = require(__dirname + '/scripts/events/' + file);
            const nameEvent = event.config.name;
            if (global.events.findIndex(i => i.config.name == nameEvent) < 0) {
                if (event.onLoad) {
                    event.onLoad({ global, Config, logger });
                }
                if (event.config.envConfig) {
                    envConfig.events.push({ name: event.config.name, configEvent: event.config.envConfig });
                    writeFileSync('./envConfig.json', JSON.stringify(envConfig, null, 4), "utf-8");
                    logger.load('Đã tải envConfig của ' + file + ' thành công', nameEvent);
                }
                global.events.push(event);
            } else {
                logger.warn(nameEvent + ' trùng tên với lệnh khác!');
            }
        } catch (err) {
            logger.error('Đã xảy ra lỗi khi tải event ' + file + ': ' + err);
        }
    }
    logger.log(getText('EVENT_LOAD_FILE', listFile.length), 'event');
};

async function database({ global, Config, logger, timeStart, getText }) {
    if (Config.DATABASE.type == 'local') {
        const { join } = require('path');
        const pathThreads = join(__dirname, '/app/database/', 'threads.json');
        const pathUsers = join(__dirname, '/app/database/', 'users.json');
        const threads = require(pathThreads);
        const users = require(pathUsers);

        global.allThreadData = threads;
        for (var key in threads) {
            global.allThreadID.push(key);
            if (threads[key].banned.status == true) {
                global.threadBanned.push(threads[key].id)
            }
        }
        global.allUserData = users;
        for (var key in users) {
            global.allUserID.push(key);
            if (users[key].banned.status == true) {
                global.userBanned.push(users[key].id)
            }
        }
        logger.log('\x1b[1;36m' + getText('CHOOSE_DATABASE_LOCAL'), 'Local');
        logger.log(getText('DATABASE_READ_YES', global.allThreadID.length, global.allUserID.length) + '\n', 'Database');
    }
    if (Config.DATABASE.type == 'mongodb') {
        try {
            const threadsModels = require('./app/models/threadsModel.js');
            const usersModels = require('./app/models/usersModel.js');
            const threads_data = (await threadsModels.find({ type: 'thread' }))[0].data || {};
            const users_data = (await usersModels.find({ type: 'user' }))[0].data || {};
            global.allThreadData = threads_data;
            for (var key in threads_data) {
                if (key != undefined) {
                    global.allThreadID.push(key);
                    if (threads_data[key].banned.status == true) {
                        global.threadBanned.push(threads_data[key].id)
                    }
                }
            }
            global.allUserData = users_data;
            for (key in users_data) {
                if (key != undefined) {
                    global.allUserID.push(key);
                    if (users_data[key].banned.status == true) {
                        global.userBanned.push(users_data[key].id)
                    }
                }
            }
            logger.log(getText('DATABASE_READ_YES', global.allThreadID.length, global.allUserID.length) + '\n', 'Database');
            logger.log('\x1b[1;37m' + getText('INFO_DONE') + '\x1b[37m', 'info status');
            logger.log(`====== ${Date.now() - timeStart}ms ======`, 'loader');
        } catch (err) {
            logger.log('\x1b[1;37m' + getText('INFO_DONE') + '\x1b[37m', 'info status');
            logger.log(`====== ${Date.now() - timeStart}ms ======`, 'loader');
        }
    }
};

module.exports = {
    commands,
    events,
    database
}