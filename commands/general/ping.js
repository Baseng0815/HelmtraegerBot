const { Command } = require('discord-akairo');

class PingCommand extends Command {
    constructor() {
        super('ping', {
            aliases: ['ping'],
            description: {
                content: 'Send back pong',
                usage: '<>',
                examples: [ 'ping' ]
            },
        });
    }

    exec(message) {
        message.channel.send('Pong');
    }
}

module.exports = PingCommand
