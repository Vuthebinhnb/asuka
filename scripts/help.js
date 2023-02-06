'use strict';
module.exports = {
  config: {
    name: 'help',
    ver: '1.0.0',
    role: '0/1',
    author: ['Lawer Team'],
    description: 'Danh sách lệnh hiện có.',
    location: __filename,
    timestamps: 1,
      envConfig: {
      "autoUnsend": true,
      "delayUnsend": 55
    }
  },
  onMessage: out
};
async function out({ event, api, global, message, args, Config, Threads }) {
  var command = global.scripts.some(i => i.config.name == args[0]);
  const { autoUnsend, delayUnsend } = global.envConfig("help");
  if (args[0] == 'all') {
    var list = global.scripts;
    var page = 1;
    page = parseInt(args[1]) || 1;
    page < -1 ? page = 1 : "";
    var limit = 9999999999999;
    var msg = '=== DANH SÁCH LỆNH ===\n\n';
    var numPage = Math.ceil(list.length / limit);
    if (page > numPage) return api.sendMessage('» Help all còn ghi số trang chi vậy?', event.threadID, event.messageID);
    for (var i = limit * (page - 1); i < limit * (page - 1) + limit; i++) {
      if (i >= list.length) break;
      msg += `『${i + 1}』 - ${list[i].config.name}\n`;
    }
    msg += '✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏\n» Hiện đang có ' + list.length + ' lệnh đang được chạy trên bot này';
    api.sendMessage(msg, event.threadID, async (error, info) => {
      if (autoUnsend) {
        await new Promise(resolve => setTimeout(resolve, delayUnsend * 1000));
        api.unsendMessage(info.messageID);
        return;
      } else return;
    });
    return;
  }
  if (!command) {
    var list = global.scripts;
    var page = 1;
    page = parseInt(args[0]) || 1;
    page < -1 ? page = 1 : "";
    var limit = 15;
    var msg = '=== DANH SÁCH LỆNH ===\n\n';
    var numPage = Math.ceil(list.length / limit);
    if (page > numPage) return api.sendMessage('» Không có trang ' + page + '\n» hiện tại có ' + numPage + ' trang.\n» Dùng ' + prefix + help + ' <số trang>', event.threadID, event.messageID);
    for (var i = limit * (page - 1); i < limit * (page - 1) + limit; i++) {
      if (i >= list.length) break;
      msg += `『${i + 1}』 - ${list[i].config.name}\n» Mô tả: ${list[i].config.description}\n» Quyền hạn: ${(list[i].config.role == 0) ? 'Người dùng' : (list[i].config.role == 1) ? 'Quản trị viên' : (list[i].config.role == 2) ? 'Người điều hành bot' : (list[i].config.role == 3) ? 'Người hỗ trợ cho người điều hành bot' : 'Lệnh này hiện chưa có role nhất định.'}\n\n`;
    }
    msg += '✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏\n» Hiện đang có ' + list.length + ' lệnh đang được chạy trên bot này';
    msg += '\n» Trang (' + page + '/' + numPage + ')' + '. Dùng help [số trang/all] để xem các trang khác';
    api.sendMessage(msg, event.threadID, async (error, info) => {
      if (autoUnsend) {
        await new Promise(resolve => setTimeout(resolve, delayUnsend * 1000));
        api.unsendMessage(info.messageID);
        return;
      } else return;
    });
    return;
  } else {
    var command_1 = global.scripts.find(i => i.config.name == args.join(" "));
    var name = command_1.config.name.toUpperCase();
    var version = command_1.config.ver;
    var role = (command_1.config.role == 0) ? 'Người dùng' : (command_1.config.role == 1) ? 'Quản trị viên' : (command_1.config.role == 2) ? 'Người điều hành bot' : (command_1.config.role == 3) ? 'Người hỗ trợ cho người điều hành bot' : 'Lệnh này hiện chưa có role nhất định.'
    var author = (command_1.config.author.length > 1) ? command_1.config.author.join(", ") : command_1.config.author[0]
    var description = command_1.config.description;
    var timestamps = command_1.config.timestamps;
    return api.sendMessage('» ' + name + ' «\n» Phiên bản: ' + version + '\n» Role: ' + role + '\n» Author: ' + author + '\n» Miêu tả: ' + description + '\n» Thời gian chờ: ' + timestamps + 's', event.threadID, event.messageID);
  }
}