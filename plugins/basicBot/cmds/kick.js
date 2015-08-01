module.exports = function (basicBot) {
    basicBot.events.command_kick = function (message) {
        if (message.from.rank >= this.core.ranks.BOUNCER) {
            var user = message.getUser(0);

            if (!user) {
                message.sendReply("Error, couldn't find user");
            }
            else {
                user.kick();
            }
        }
        else {
            message.from.sendReply("Command only available to staff", {emote:true});
        }
    };
};