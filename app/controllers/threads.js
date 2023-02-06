'use strict';

const threadsModels = require('../models/threadsModel.js');
const usersModels = require('../models/usersModel.js');

module.exports = function({ api, global, logger }) {
    const { existsSync, writeFileSync } = require('fs-extra');
    const { join } = require('path');
    const { config } = global;
    const pathDataThread = join(__dirname, '../database/', 'threads.json');
    const pathDataUser = join(__dirname, '../database/', 'users.json');
    const databaseType = config.DATABASE.type;

    let Threads = {},
        Users = {};
    if (databaseType == 'mongodb') {
        global.allThreadData = Threads;
        global.allUserData = Users;
    } else {
        if (!existsSync(pathDataThread)) {
            writeFileSync(pathDataThread, JSON.stringify(Threads, null, 2));
        }
        if (!existsSync(pathDataUser)) {
            writeFileSync(pathDataUser, JSON.stringify(Users, null, 2));
        }
        Threads = require(pathDataThread);
        Users = require(pathDataUser);
    }
    global.allThreadData = Threads;
    global.allUserData = Users;

    async function saveData(Tid) {
        if (databaseType == 'local') {
            global.allThreadData = Threads;
            writeFileSync(pathDataThread, JSON.stringify(Threads, null, 2));
        } else if (databaseType == "mongodb") {
            await threadsModels.updateOne({
                    type: "thread"
                }, {
                    data: Threads
                })
                .catch(err => logger.error("Đã xảy ra lỗi khi cập nhật dữ liệu của nhóm mang TID: " + Tid + "\n" + err, "MONGODB"));
            global.allThreadData = Threads;
        } else throw new Error("Database Type không hợp lệ");
    }

    async function saveDataUser(id) {
        if (databaseType == 'local') {
            global.allUserData = Users;
            writeFileSync(pathDataUser, JSON.stringify(Users, null, 2));
        } else if (databaseType == 'mongodb') {
            await usersModels.updateOne({ type: "user" }, {
                    data: Users
                })
                .catch(err => logger.error("Đã xảy ra lỗi khi cập nhật dữ liệu của người dùng mang ID: " + Uid + "\n" + err, "MONGODB"));
            global.allUserData = Users;
        } else throw new Error("Database Type không hợp lệ");
    }

    async function createData(threadID) {
        try {
            if (databaseType == 'mongodb') {
                Threads = (await threadsModels.find({ type: 'thread' }))[0].data || {};
                if (Threads[threadID]) return;
            }
            global.allThreadData = Threads;
            if (Threads[threadID]) return;
            if (global.allThreadID.some(e => e == threadID)) return;
            const threadInfo = await api.getThreadInfo(threadID);
            if (global.allThreadID.includes(threadID)) return;
            if (threadInfo.isGroup == false) return;
            const name = threadInfo.threadName;
            const { userInfo } = threadInfo;
            const newadminsIDs = [];
            threadInfo.adminIDs.forEach(item => newadminsIDs.push(item.id));

            const newMembers = {};
            for (let user of userInfo) {
                const senderID = user.id;
                const dataUser = {
                    id: senderID,
                    name: user.name,
                    nickname: threadInfo.nicknames[senderID] || null,
                    inGroup: true,
                    exp: 0,
                    money: 0
                };
                newMembers[senderID] = dataUser;
            }

            const data = {
                id: threadID,
                name: name,
                emoji: threadInfo.emoji,
                prefix: null,
                language: null,
                members: newMembers,
                adminIDs: newadminsIDs,
                approvalMode: threadInfo.approvalMode,
                status: true,
                banned: {
                    status: false,
                    reason: null,
                    time: null
                },
                data: {
                    onlyQTV: false
                },
                avatar: threadInfo.imageSrc
            };
            Threads[threadID] = data;
            await saveData(threadID);
            global.allThreadID.push(threadID);
            logger.log(`\x1b[1;32mNew Thread: \x1b[1;37m${threadID} | \x1b[1;35m${name} | \x1b[1;37m${global.config.DATABASE.type}\x1b[37m`, "DATABASE");

            if (databaseType == 'mongodb') {
                Users = (await usersModels.find({ type: 'user' }))[0].data || {};
            }
            global.allUserData = Users;
            for (let i of userInfo) {
                if (!global.allUserData[i.id]) {
                    if (!i.vanity) var vanity = 'profile.php?id=' + i.id;
                    else var vanity = i.vanity;
                    var profileUrl = 'https://www.facebook.com/' + vanity;
                    var add_user = {
                        id: i.id,
                        name: i.name,
                        firstName: i.firstName,
                        vanity: i.vanity,
                        gender: i.gender,
                        type: i.type,
                        profileUrl,
                        exp: 0,
                        money: 0,
                        banned: {
                            status: false,
                            reason: null,
                            time: null
                        },
                        data: {},
                        avatar: i.thumbSrc
                    };
                    Users[i.id] = add_user;
                    await saveDataUser(i.id);
                    global.allUserID.push(i.id);
                    logger.log(
                        '\x1b[1;36mNew User: \x1b[1;37m' +
                        i.id +
                        ' | \x1b[1;31m' +
                        i.name +
                        '\x1b[37m',
                        'user'
                    );
                }
            }
        } catch (err) {
            //logger.error(err, 'CREATE THREAD DATA');
        }
    }

    async function refreshInfo(threadID, callback) {
        try {
            if (!Threads[threadID]) return false;
            const ThreadInfo = await getData(threadID);
            const newThreadInfo = await api.getThreadInfo(threadID);
            const newadminsIDs = [];
            newThreadInfo.adminIDs.forEach(item => newadminsIDs.push(item.id));
            const { userInfo } = newThreadInfo;
            const oldMembers = ThreadInfo.members;
            const newMembers = {};
            for (let user of userInfo) {
                const senderID = user.id;
                const oldDataUser = oldMembers[senderID];
                const data = {
                    name: user.name,
                    nickname: newThreadInfo.nicknames[senderID],
                    exp: oldMembers[senderID] ? oldMembers[senderID].exp : 0,
                    money: oldMembers[senderID] ? oldMembers[senderID].money : 0
                };
                newMembers[senderID] = {...oldDataUser, ...data };
            }

            ThreadInfo.name = newThreadInfo.name;
            ThreadInfo.emoji = newThreadInfo.emoji;
            ThreadInfo.members = newMembers;
            ThreadInfo.adminIDs = newadminsIDs;
            ThreadInfo.approvalMode = newThreadInfo.approvalMode;
            ThreadInfo.status;
            ThreadInfo.banned;
            ThreadInfo.data;
            ThreadInfo.avatar = newThreadInfo.imageSrc;

            Threads[threadID] = ThreadInfo;

            await saveData(threadID);
            if (callback && typeof callback == "function") callback(null, Threads[threadID]);
            return Threads[threadID];
        } catch (err) {
            if (callback && typeof callback == "function") callback(err, null);
            return err;
        }
    }

    async function getAll(callback) {
        try {
            const data = Threads;
            if (callback && typeof callback == 'function') callback(null, data);
            return data;
        } catch (err) {
            logger.error(err.stack, 'GETALL THREAD DATA');
            if (callback && typeof callback == 'function') callback(err, null);
            return err;
        }
    }

    async function getKey(keys, callback) {
        try {
            if (!keys) return Threads;
            if (!Array.isArray(keys))
                throw new Error('Tham số truyền vào phải là 1 array');
            const data = [];
            for (let threadID in Threads) {
                const db = { id: threadID };
                const dataT = Threads[threadID];
                for (let key of keys) db[key] = dataT[key];
                data.push(db);
            }
            if (callback && typeof callback == 'function') callback(null, data);
            return data;
        } catch (err) {
            logger.error(err.stack, 'GETKEY DATA THREAD');
            if (callback && typeof callback == 'function') callback(err, null);
            return err;
        }
    }

    async function getData(threadID) {
        try {
            if (databaseType == 'mongodb') {
                if (!global.allThreadData[threadID]) {
                    Threads = (await threadsModels.find({ type: 'thread' }))[0].data || {};
                }
            }
            global.allThreadData = Threads;
            if (!Threads[threadID]) return false;
            const data = Threads[threadID];
            return data;
        } catch (e) {}
    }

    async function setData(threadID, options, callback) {
        try {
            if (!threadID) throw new Error('threadID không được để trống');
            if (isNaN(threadID)) throw new Error('threadID không hợp lệ');
            if (typeof options != 'object')
                throw new Error('Tham số options truyền vào phải là 1 object');
            Threads[threadID] = {...Threads[threadID], ...options };
            await saveData(Threads);
            if (callback && typeof callback == 'function')
                callback(null, Threads[threadID]);
            return Threads[threadID];
        } catch (err) {
            logger.error(err.stack, 'SET THREAD DATA');
            if (callback && typeof callback == 'function') callback(err, null);
            return err;
        }
    }

    async function delData(threadID, callback) {
        try {
            delete Threads[threadID];
            await saveData(threadID);
            if (callback && typeof callback == 'function')
                callback(null, 'DELDATA THREAD ' + threadID + ' SUCCES');
            return true;
        } catch (err) {
            logger.error(err.stack, 'DEL THREAD DATA');
            if (callback && typeof callback == 'function') callback(err, null);
            return err;
        }
    }

    return {
        createData,
        refreshInfo,
        getAll,
        getKey,
        getData,
        setData,
        delData
    };
};