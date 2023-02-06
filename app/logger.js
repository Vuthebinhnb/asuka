"use strict";

function load(data, type) {
  console.log('\x1b[1;37m-> \x1b[1;32m[ ' + type.toUpperCase() + ' ]\x1b[1;37m <-\x1b[0m', data);
};
function log(data, type) {
  var color = ["\x1b[1;33m", "\x1b[1;34m", "\x1b[1;35m", '\x1b[1;36m', '\x1b[1;32m'];
  var more = color[Math.floor(Math.random() * color.length)];
  console.log('\x1b[1;37m-> ' + more + '[ ' + type.toUpperCase() + ' ]\x1b[1;37m <-\x1b[0m', data);
};
function error(data, type) {
  if (!this.type) var type_log = 'error';
  else var type_log = type;
  console.log('\x1b[1;37m-> \x1b[1;31m[ ' + type_log.toUpperCase() + ' ]\x1b[1;37m <-\x1b[0m', data);
}
function warn(data, type) {
  if (!this.type) var type_log = 'warning';
  else var type_log = type;
  console.log('\x1b[1;37m-> \x1b[1;93m[ ' + type_log.toUpperCase() + ' ]\x1b[1;37m <-\x1b[0m', data);
}

module.exports = {
  load,
  log,
  error,
  warn
}