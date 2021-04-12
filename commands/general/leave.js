const { Command } = require('discord-akairo');

class LeaveCommand extends Command {
    constructor() {
        super('leave', {
            aliases: ['leave'],
            description: {
                content: 'Make the bot leave the voice channel',
                usage: '<>',
                examples: [ 'leave', ]
            },
        });
    }

    async exec(message) {
        const userChannel = message.member.voice.channel;
        const botChannel = message.guild.voice.channel;
        if (userChannel == botChannel && userChannel) {
            botChannel.leave();
        }
    }
}

module.exports = LeaveCommand;
