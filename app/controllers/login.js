"use strict";

const mongoose = require("mongoose");
async function login({ global, logger, getText }) {
    const { config } = global;
    const databaseType = config.DATABASE.type;
    const threadsModel = require('../models/threadsModel.js');
    const usersModel = require('../models/usersModel.js');
    if (databaseType == "mongodb" && config.DATABASE.uriMongodb) {
        const P = "\\|/-";
        let ij = 0;
        const loadmongo = setInterval(() => {
            logger.log(P[ij++] + getText('CONNECTION_DATABASE'), "MONGODB");
            ij %= P.length;
        }, 120);

        const uriConnect = config.DATABASE.uriMongodb;
        await mongoose.connect(uriConnect, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            })
            .then(result => {
                logger.log("\x1b[1;33m" + getText('CONNECTION_DATABASE_SUCCESS'), "MONGODB");
                clearInterval(loadmongo);
            })
            .catch(err => {
                logger.error(getText('CONNECTION_DATABASE_FAILED', err.stack + '\n'), "MONGODB");
                clearInterval(loadmongo);
                process.exit(0);
            });

        if ((await threadsModel.find({ type: "thread" })).length == 0) await threadsModel.create({
            type: "thread",
            data: Object
        });

        if ((await usersModel.find({ type: "user" })).length == 0) await usersModel.create({
            type: "user",
            data: Object
        });
    }
}

module.exports = {
    login
}