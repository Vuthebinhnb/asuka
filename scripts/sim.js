'use strict';
module.exports = {
    config: {
        name: 'sim',
        ver: '1.0.0',
        role: 0,
        author: ['MạnhG'],
        description: 'Trò chuyện với simsimi dễ thương nhất.',
        location: __filename,
        timestamps: 0
    }
};

async function simsimi(a) {
    const axios = require('axios'),
        g = (a) => encodeURIComponent(a);
    try {
        var { data: j } = await axios({ url: `http://manhict.tech/sim?type=ask&ask=${g(a)}`, method: "GET" });
        return { error: !1, data: j }
    } catch (p) {
        return { error: !0, data: {} }
    }
}

module.exports.onMessage = async function({ api, event, args }) {
    const { threadID, messageID } = event, body = (args) => api.sendMessage(args, threadID, messageID);
    if (0 == args.length) return body("» You have not entered the message");
    var { data, error } = await simsimi(args.join(" "), api, event);
    return !0 == data ? void 0 : !1 == data.answer ? body(data.error) : body(data.answer);
};