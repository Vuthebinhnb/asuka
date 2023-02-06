'use strict';
module.exports = {
    config: {
        name: 'menu',
        ver: '1.0.0',
        role: 0,
        author: ['Lawer Team'],
        description: 'Danh sách lệnh.',
        location: __filename,
        timestamps: 1
    },
    onMessage: out
};
async function out({ event, api, global, message, args, Config, Threads }) {
    const command = global.scripts.some(i => i.config.name == args[0]);
    const prefix = await Threads.getData(event.threadID).prefix || Config['PREFIX'];
    if (!command) {
        const commands = global.scripts;
        var group = [],
            msg = "";
        for (const commandConfig of commands) {
            var role = (commandConfig.config.role == 0) ? 'Người dùng' : (commandConfig.config.role == 1) ? 'Quản trị viên' : (commandConfig.config.role == 2) ? 'Người điều hành bot' : (commandConfig.config.role == 3) ? 'Hỗ trợ Admin' : 'Hỗ trợ đặc biệt';
            if (!group.some(item => item.group.toLowerCase() == role.toLowerCase())) group.push({ group: role.toLowerCase(), cmds: [commandConfig.config.name] });
            else group.find(item => item.group.toLowerCase() == role.toLowerCase()).cmds.push(commandConfig.config.name);
        }
        group.forEach(commandGroup => msg += `🍄➻❥ ${commandGroup.group.charAt(0).toUpperCase() + commandGroup.group.slice(1)} \n${commandGroup.cmds.join(', ')}\n\n`);
        return api.sendMessage(msg + `✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏\n[ Sử dụng: "${prefix}help từng lệnh ở trên" để xem chi tiết cách sử dụng! | Hiện tại đang có ${commands.length} lệnh có thể sử dụng trên bot này ]`, event.threadID, async(error, info) => {
            if (true) {
                await new Promise(resolve => setTimeout(resolve, 55 * 1000));
                api.unsendMessage(info.messageID);
                return;
            } else return;
        });

    }
}