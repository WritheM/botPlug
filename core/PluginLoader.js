var fs = require("fs");
var PluginConfig = require("./PluginConfig.js");

function PluginLoader(manager, directory) {
    this.manager = manager;
    this.directory = directory;

    this.loaded = false;
    this.events = {};

    this.reloadMeta();
}

PluginLoader.prototype.reloadMeta = function () {
    var file = this.directory + "/meta.json";
    this.meta = JSON.parse(fs.readFileSync(file, "utf8"));
};

PluginLoader.prototype._load = function () {
    if (this.loaded) {
        return true;
    }

    // get plugin script path
    var path = "../" + this.directory + "/" + this.meta.script;
    try {
        var plugin = require(path);

        if (typeof (plugin) === "function") {
            this.plugin = plugin(this);
        }
        else {
            this.plugin = plugin;
        }

        // if here, plugin loaded successfully

        this.loaded = true;

        this.plugin.events.onLoad.call(this.plugin, this);
        console.log("Loaded " + this.meta.name);
    }
    catch (e) {
        // TODO: consider removing try/catch, or rethrowing.
        console.log(e);
        return false;
    }
};

PluginLoader.prototype._unload = function () {
    var path = "../" + this.directory + "/" + this.meta.script;

    this.fireEvent("onUnload");

    this.loaded = false;
    this.plugin = undefined;

    try {
        // http://stackoverflow.com/a/6677355
        var name = require.resolve(path);
        delete require.cache[name];
    }
    catch (e) {

    }
};

PluginLoader.prototype.load = function () {
    var deps = this.manager.getDependencies(this);
    for (var i = 0; i < deps.length; i++) {
        var dep = deps[i];
        dep._load();
    }
};

PluginLoader.prototype.unload = function () {
    var deps = this.manager.filterLoaded(this.manager.getDependants(this));
    for (var i = 0; i < deps.length; i++) {
        var dep = deps[i];
        dep._unload();
    }
    this._unload();
};

PluginLoader.prototype.reload = function () {
    var deps = this.manager.filterLoaded(this.manager.getDependants(this));

    this.unload();
    this.load();

    //reload everything that got unloaded (as they were depending on this)
    for (var i = 0; i < deps.length; i++) {
        var dep = deps[i];
        dep.load();
    }
};

PluginLoader.prototype.getConfig = function () {
    var manconf = this.manager.getConfig();

    var conf = {};
    if ("config" in this.meta) {
        conf = this.meta.config;
    }

    //this.config.util.extendDeep(this.config, )
    manconf.util.setModuleDefaults(this.meta.name, conf);
    return new PluginConfig(manconf, this.meta.name);
};

PluginLoader.prototype.fireEvent = function (eventname) {
    if (!this.loaded) {
        return;
    }
    if (!(eventname in this.plugin.events)) {
        return;
    }
    try {
        var args = Array.prototype.slice.call(arguments);
        args.shift();

        this.plugin.events[eventname].apply(this.plugin, args);
    }
    catch (e) {
        console.log("Event handler crashed", e);
    }
};

module.exports = PluginLoader;