/**
 * @author MạnhG
 * @warn Do not edit code or edit credits
 */
'use strict';
module.exports = {
    config: {
        name: 'teach',
        ver: '1.0.0',
        role: 2,
        author: ['MạnhG'],
        description: 'Dạy bot (dùng cho lệnh sim)',
        timestamps: 2
    }
};

module.exports.onMessage = ({ api, event, global }) => {
    const { threadID, messageID, senderID } = event;
    return api.sendMessage("Reply tin nhắn này nhập câu hỏi cho simsimi", threadID, (err, info) => {
        global.reply.push({
            step: 1,
            name: 'teach',
            messageID: info.messageID,
            content: {
                id: senderID,
                ask: "",
                ans: ""
            }
        })
    }, messageID);
}
module.exports.onReply = async({ api, event, Users, global, reply }) => {
    const axios = require("axios");
    const fs = require("fs");
    const moment = require("moment-timezone");
    var timeZ = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss | DD/MM/YYYY");
    const { threadID, messageID, senderID, body } = event;
    let by_name = (await Users.getData(senderID)).name;
    if (reply.content.id != senderID) return;
    const input = body.trim();
    const sendC = (msg, step, content) => api.sendMessage(msg, threadID, (err, info) => {
        global.reply.splice(global.reply.indexOf(reply), 1);
        api.unsendMessage(reply.messageID);
        global.reply.push({
            step: step,
            name: 'teach',
            messageID: info.messageID,
            content: content
        })
    }, messageID);
    const send = async(msg) => api.sendMessage(msg, threadID, messageID);

    let content = reply.content;
    switch (reply.step) {
        case 1:
            content.ask = input;
            sendC("Reply tin nhắn này trả lời câu hỏi vừa xong", 2, content);
            break;

        case 2:
            content.ans = input;
            global.reply.splice(global.reply.indexOf(reply), 1);
            api.unsendMessage(reply.messageID);
            let c = content;
            let res = await axios.get(encodeURI(`http://manhict.tech/sim?type=teach&ask=${c.ask}&ans=${c.ans}&by=${by_name}&apikey=manhict0205`));
            if (res.status != 200) return send("Đã có lỗi xảy ra, vui lòng thử lại sau!");
            if (res.data.error) return send(`${res.data.error}`);
            send(`Dạy sim thành công, previews:\n\n🤤Data:\n${c.ask} -> ${c.ans}\n🙇‍♂️Người dạy sim:\n${by_name}\n⏱Time: ${timeZ}`);
            break;
        default:
            break;
    }
}