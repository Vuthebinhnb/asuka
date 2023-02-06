"use strict";

const console = require('console');

/*
 Version: 1.0.0 (Chính thức)
*/
try {
    const logger = require('./app/logger.js');
    const login = require('lawerpr0ject-api');
    const Config = require('./configMain.json');
    const version_lawer = require('./version.json').version;
    const { readdirSync, readFileSync, writeFileSync, existsSync } = require('fs-extra');
    const { join, resolve } = require('path');
    const axios = require('axios');
    const timeStart = Date.now();

    if (!existsSync(__dirname + '/envConfig.json')) {
        let envConfig_1 = { scripts: [], events: [] };
        writeFileSync('./envConfig.json', JSON.stringify(envConfig_1, null, 2), 'utf-8');
    }
    const envConfig = require('./envConfig.json');
    const global = new Object({
        scripts: new Array(),
        events: new Array(),
        reply: new Array(),
        reaction: new Array(),
        timestamps: new Map(),
        node_module: new Object(),
        config: Config,
        cache: new Array(),
        allThreadID: [],
        allUserID: [],
        threadBanned: [],
        userBanned: [],
        allThreadData: {},
        allUserData: {},
        language: new Object(),
        dirConfig: __dirname + '/configMain.json'
    });
    //_____________________________GLOBAL GET TEXT_____________________________//
    const lang_Change = require('./language_scripts/change.js');
    const lang_FILE = (readFileSync(__dirname + '/language_scripts/' + Config['LANGUAGE_SCRIPTS'] || __dirname + '/language_scripts/' + 'vi_VN.loli', { encoding: 'utf-8' })).split(/\r?\n|\r/);

    const langData = lang_FILE.filter(item => item.indexOf('#') != 0 && item != '');
    // load config lang
    var q, w;
    q = langData[0];
    w = q.replace(': {', '');
    if (w.toLowerCase() != 'config' || !w) {
        logger.error("can't load config of language: " + Config['LANGUAGE_SCRIPTS'] || 'vi_VN.loli', 'language scripts');
        return process.exit(0);
    } else {
        var c, e, r, t, p;
        c = langData.indexOf('}');
        for (var d = 1; d < c; d++) {
            e = langData[d];
            p = e.indexOf('=');
            r = e.slice(0, p);
            r = r.split('[')[1].split(']')[0];
            t = e.slice(p + 2, e.length).split('"')[1];
            if (!global.language.config) global.language.config = {};
            global.language.config[r] = t;
        }
        var o, k, f;
        k = [];
        o = false;
        for (var i of langData) {
            if ((i.toLowerCase()).indexOf('index') == 0) {
                o = true;
            }
            if (o != false) {
                k.push(i);
            }
        }
        f = k.findIndex(y => y.toLowerCase().indexOf('index') == 0);
        k.splice(f, 1);
        f = k.findIndex(y => y.indexOf('}') == 0);
        k.splice(f, 1);
        for (var i of k) {
            var g, h, j, l, z;
            g = i.indexOf('=');
            h = i.slice(0, g);
            h = h.split('[')[1].split(']')[0];
            j = i.slice(g + 2, i.length).split('"')[1];
            if (!global.language.index) global.language.index = {};
            global.language.index[h] = j;
        }
    }

    function getText(...data) {
        var text = global.language.index;
        if (!text.hasOwnProperty(data[0])) throw `${__filename} - Not found key language: ${data[0]}`;
        var v, m;
        v = text[data[0]];
        for (var mm = data.length - 1; mm > 0; mm--) {
            m = RegExp('<' + mm + '>', 'g');
            v = v.replace(m, data[mm]);
        }
        return v;
    }
    //_____________________________UPTIME HOST_____________________________//
    const app = require("express")();
    app.set('port', (process.env.PORT || 8888 || 9999));
    app.get('/', function(request, response) {
        var result = 'A simple Facebook Messenger Bot made by DuyVuong and ManhG, D-jukie.'
        response.send(result);
    }).listen(app.get('port'));
    logger.load(getText('HOST_UPTIME', app.get('port')), 'HOST UPTIME');
    //_____________________________LOGIN FACEBOOK_____________________________//
    const pathFb = __dirname + '/' + Config['DATA_APPSTATE'] + '.json';
    if (!existsSync(pathFb)) {
        logger.warn(getText('FBSTATE_NO', Config['DATA_APPSTATE']));
        return process.exit(0);
    }

    const fb_state = JSON.parse(readFileSync(Config['DATA_APPSTATE'] + '.json', 'utf8'));
    logger.load(getText('FBSTATE_YES', Config['DATA_APPSTATE']), 'fbstate');
    try {
        login({ appState: fb_state }, { pauseLog: true }, function(err, api) {
            if (err) return logger.error(err.error, 'login');
            logger.load(getText('LOGIN_YES'), 'login');
            api.setOptions(Config['FCA']);
            var handlerEvent = require('./app/handlerEvent.js').onListen({ api, global, Config, logger, timeStart, getText });
            let onListen = (c) => api.listenMqtt(c);
            onListen(handlerEvent);
        })
    } catch (ex) {
        return logger.error(ex, 'error');
    }
} catch (ex) {
    console.log('\x1b[1;31mERROR:\x1b[1;37m ' + ex);
    return process.exit(0);
}
