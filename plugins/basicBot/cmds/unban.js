module.exports = function (basicBot) {
    basicBot.events.command_unban = function (message) {
        if (message.from.rank >= this.core.ranks.BOUNCER) {
            //TODO: !unban
            message.from.sendEmote("Not implemented yet");
        }
        else {
            message.from.sendEmote("Command only available to staff");
        }
    };
};