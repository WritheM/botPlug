var fs = require("fs");
var PluginManager = require("./PluginManager.js");
var Ranks = require("./Ranks.js");

global.__core = __dirname + "/";

function Core() {
    Core.prototype.loadConfig();


    //TODO: make into class (issue #25)
    this.ranks = new Ranks(this);

    if (this.config.core.logger === undefined) {
        // set some sane defaults
        this.config.core.logger = {
            "appenders": [{
                type: "console"
            }],
            "replaceConsole": true
        };
    }

    var log4js = require("log4js");
    this.log4js = log4js;
    log4js.configure(this.config.core.logger);
    this.logger = log4js.getLogger();

    this.plugman = new PluginManager(this);
    this.plugman.start();
}

Core.prototype.loadConfig = function () {
    this.config = {
        "core": {
            "paths": ["coreplugins", "plugins"],
            "plugins": []
        }
    };

    try {
        this.config = JSON.parse(fs.readFileSync("config.json", "utf8"));
    }
    catch (e) {
        console.log(e);
    }

    return this.config;
};

Core.prototype.saveConfig = function () {
    fs.writeFileSync("config.json", JSON.stringify(this.config, null, 4), "utf8");
};

module.exports = Core;