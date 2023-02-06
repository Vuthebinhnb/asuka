"use strict";
module.exports.config = {
    name: 'prefix',
    role: 1,
    version: '1.0.0',
    author: 'MạnhG',
    description: 'Thay đổi prefix cho nhóm.',
    timestamps: 0
};

module.exports.language = {
    "vi_VN.loli": {
        "missingInput": "Để thay đổi prefix, sử dụng prefix <new prefix>",
        "successChange": "Đã chuyển đổi prefix của nhóm thành: %1"
    },
    "en_US.loli": {
        "missingInput": "To change the prefix, enter prefix <new prefix>",
        "successChange": "Changed prefix into: %1"
    }
}

module.exports.onMessage = async function({ api, event, Threads, args, Config, getText }) {
    const { threadID, senderID, messageID } = event;
    if (!args[0]) return api.sendMessage(getText("missingInput"), threadID, messageID);
    if (args[0] == 'default' || args[0] == '-df') {
        var prefix_dfaut = Config.prefix;
        await Threads.setData(threadID, { prefix: prefix_dfaut });
        return api.sendMessage(getText(('successChange'), prefix_dfaut), threadID, messageID);
    } else {
        let prefix_of = args[0];
        await Threads.setData(threadID, { prefix: prefix_of });
        return api.sendMessage(getText(('successChange'), prefix_of), threadID, messageID);
    }
}