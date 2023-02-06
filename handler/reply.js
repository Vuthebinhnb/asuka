"use strict";

async function index({ global, api, event, message, Config, logger, getText, Threads, Users }) {
    const { threadID, senderID, isGroup } = event;
    if (!event.messageReply) return;
    const { reply } = global;
    if (reply.length != 0) {
        const indexOfHandle = reply.findIndex(e => e.messageID == event.messageReply.messageID);
        if (indexOfHandle < 0) return;
        const indexOfMessage = reply[indexOfHandle];
        if (global.scripts.some(i => i.config.name == indexOfMessage.name)) {
            try {
                var run = global.scripts.find(i => i.config.name == indexOfMessage.name);
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
                obj.message = message;
                obj.Threads = Threads;
                obj.Users = Users;
                obj.reply = indexOfMessage;
                obj.getText = getTextC;
                run.onReply(obj);
                return;
            } catch (err) {
                logger.error("» Có lỗi xảy ra tại hander reply", "reply");
                return api.sendMessage(err, event.threadID, event.messageID);
            }
        } else {
            return api.sendMessage('» Thiếu dữ liệu để có thể thực hiện lệnh.', event.threadID, event.messageID);
        }
    }
}

module.exports = {
    index
}