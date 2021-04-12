const discord = require('discord.js');
const { Command, Argument } = require('discord-akairo');

const { Uwuifier } = require('uwuifier');

class UwuifyCommand extends Command {
    constructor() {
        super('uwuify', {
            aliases: ['uwuify'],
            description: {
                content: 'OwO xpp',
                usage: '',
                examples: [ '' ]
            },
        });

        this.uwuifier = new Uwuifier();
    }

    async exec(message) {
        const messages = await message.channel.messages.fetch({ limit: 8 });
        const last_message = messages.find(msg => {
            return !msg.author.bot && msg.id != message.id;
        });

        let uwu = this.uwuifier.uwuifySentence(last_message.content);
        await message.channel.send(uwu);
    }
}

module.exports = UwuifyCommand;
