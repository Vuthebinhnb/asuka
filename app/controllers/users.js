"use strict";

const usersModels = require('../models/usersModel.js');

module.exports = function({ api, global, logger }) {
    const { existsSync, writeFileSync } = require('fs-extra');
    const { join } = require('path');
    const pathDataUser = join(__dirname, '../database/', 'users.json');

    const { config } = global;
    const databaseType = config.DATABASE.type;
    let Users = {};
    if (databaseType == 'mongodb') {
        global.allUserData = Users;
    }
    if (databaseType == 'local') {
        if (!existsSync(pathDataUser)) {
            writeFileSync(pathDataUser, JSON.stringify(Users, null, 2));
        }
        Users = require(pathDataUser);
    }
    global.allUserData = Users;

    async function saveData(id) {
        if (databaseType == 'local') {
            global.allUserData = Users;
            writeFileSync(pathDataUser, JSON.stringify(Users, null, 2));
        } else if (databaseType == 'mongodb') {
            await usersModels.updateOne({ type: "user" }, {
                    data: Users
                })
                .catch(err => logger.error("Đã xảy ra lỗi khi cập nhật dữ liệu của người dùng mang id " + Uid + "\n" + err, "MONGODB"));
            global.allUserData = Users;
        } else throw new Error("Database Type không hợp lệ");
    }

    async function createData(senderID) {
        try {
            if (databaseType == 'mongodb') {
                Users = (await usersModels.find({ type: 'user' }))[0].data || {};
                if (Users[senderID]) return;
            }
            global.allUserData = Users;
            if (Users[senderID]) return;
            if (global.allUserID.includes(senderID)) return;
            const infoUser = (await api.getUserInfo(senderID))[senderID];
            if (global.allUserID.some(e => e == senderID)) return;
            if (infoUser.gender == 2) var gender = 'MALE';
            else var gender = 'FEMALE';
            const data = {
                id: senderID,
                name: infoUser.name,
                firstName: infoUser.firstName,
                vanity: infoUser.vanity,
                gender: gender,
                type: infoUser.type,
                profileUrl: infoUser.profileUrl,
                money: 0,
                exp: 0,
                banned: {
                    status: false,
                    reason: null,
                    time: null
                },
                data: {},
                avatar: infoUser.thumbSrc
            };

            Users[senderID] = data;
            await saveData(senderID);
            global.allUserID.push[senderID]
            logger.log(`\x1b[1;36mNew User: \x1b[1;37m${senderID} | \x1b[1;33m${infoUser.name} | \x1b[1;37m${global.config.DATABASE.type}\x1b[37m`, "DATABASE");
        } catch (err) {
            //logger.error(err.stack, "CREATEDATA USER");
        }
    }

    async function refreshInfo(senderID, callback) {
        try {
            if (!Users[senderID]) return false;
            const InfoUser = await getData(senderID);
            const updateInfoUser = (await api.getUserInfo(senderID))[senderID];
            if (updateInfoUser.gender == 2) var gender = 'MALE';
            else var gender = 'FEMALE';
            InfoUser.name = updateInfoUser.name;
            InfoUser.firstName = updateInfoUser.firstName;
            InfoUser.vanity = updateInfoUser.vanity;
            InfoUser.gender = gender;
            InfoUser.type = updateInfoUser.type;
            InfoUser.profileUrl = updateInfoUser.profileUrl;
            InfoUser.money;
            InfoUser.exp;
            InfoUser.banned;
            InfoUser.data;
            InfoUser.avatar;

            Users[senderID] = InfoUser;

            await saveData(senderID);
            if (callback && typeof callback == "function") callback(null, InfoUser);
            return InfoUser;
        } catch (err) {
            if (callback && typeof callback == "function") callback(err, null);
            logger.error(err.stack, "CREATEDATA USER");
            return err;
        }
    }

    async function getAll(callback) {
        try {
            const data = Users;
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch (err) {
            logger.error(err.stack, "GETDATA USER");
            if (callback && typeof callback == "function") callback(err, null);
            return err;
        }
    }

    async function getKey(keys, callback) {
        try {
            if (!keys) return Users;
            if (!Array.isArray(keys)) return "Tham số truyền vào phải là 1 array";
            const data = [];
            for (let senderID in Users) {
                const db = { id: senderID };
                const dataU = Users[senderID];
                for (let key of keys) db[key] = dataU[key];
                data.push(db);
            };
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch (err) {
            if (callback && typeof callback == "function") callback(err, null);
            logger.error(err, "GETALL USER");
            return err;
        }
    }


    async function getData(senderID) {
        try {
            if (databaseType == 'mongodb') {
                if (!global.allUserData[senderID]) {
                    Users = (await usersModels.find({ type: 'user' }))[0].data || {};
                }
            }
            global.allUserData = Users;
            if (!Users[senderID]) return false;
            else {
                const data = Users[senderID];
                return data;
            }
        } catch (e) {}
    }

    async function setData(senderID, options, callback) {
        try {
            if (isNaN(senderID)) throw new Error("senderID không được để trống");
            if (isNaN(senderID)) throw new Error("senderID không hợp lệ");
            if (typeof options != 'object') throw new Error("Options truyền vào phải là 1 object");
            var keys = Object.keys(options);
            if (!Users[senderID]) return `Người dùng mang ID: ${senderID} không tồn tại trong database`;
            for (let key of keys) Users[senderID][key] = options[key];
            await saveData(senderID);
            if (callback && typeof callback == "function") callback(null, senderID[senderID]);
            return senderID[senderID];
        } catch (err) {
            logger.error(err.stack, "SETDATA USER");
            if (callback && typeof callback == "function") callback(err, null);
            return err;
        }
    }

    async function delData(senderID, callback) {
        try {
            delete Users[senderID];
            const data = await saveData(senderID);
            if (callback && typeof callback == "function") callback(null, data);
        } catch (err) {
            logger.error(err.stack, "DELDATA USER");
            if (callback && typeof callback == "function") callback(err, null);
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
    }
}