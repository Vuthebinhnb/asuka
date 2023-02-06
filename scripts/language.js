"use strict";
module.exports.config = {
    name: 'language',
    role: 0,
    version: '1.0.0',
    author: 'MạnhG',
    description: 'Thay đổi ngôn ngữ bot cho nhóm.',
    timestamps: 0
};

module.exports.language = {
    "vi_VN.loli": {
        "missingInput": `Để thay đổi ngôn ngữ bot, sử dụng language <new language>\n\nHD: language en/english`,
        "successChange": "Đã chuyển đổi ngôn ngữ bot của nhóm thành: %1"
    },
    "en_US.loli": {
        "missingInput": `To change the language, enter language <new language>\n\nEx: language vi/vietnames`,
        "successChange": "Changed language into: %1"
    }
}

module.exports.onMessage = async function({ api, event, Threads, args, Config, getText }) {
    const { threadID, senderID, messageID } = event;
    switch (args[0]) {
        case "vietnames":
        case "vi":
            {
                await Threads.setData(threadID, { language: "vi_VN.loli" });
                api.sendMessage(getText(("successChange"), args[0]), threadID, messageID)
            }
            break;

        case "english":
        case "en":
            {
                await Threads.setData(threadID, { language: "en_US.loli" });
                api.sendMessage(getText(("successChange"), args[0]), threadID, messageID)
            }
            break;

        default:
            {
                api.sendMessage(getText("missingInput"), threadID, messageID);
            }
            break;
    }
}