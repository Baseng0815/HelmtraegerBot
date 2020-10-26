const discord = require('discord.js');
const { Command } = require('discord-akairo');

const log = require('../../log.js');

class HelpCommand extends Command {
    constructor() {
        super('help', {
            aliases: ['help'],
            args: [
                {
                    id: 'command',
                    type: 'commandAlias'
                }
            ],
            description: {
                content: 'Show description of a command or list all commands',
                usage: '<command>',
                examples: [ 'leave', 'help', 'autist' ]
            },
        });
    }

    exec(message, { command }) {
        if (!command) {
            // no argument given? send default help
            this.defaultHelp(message);
            return;
        }

        const clientPermissions = command.clientPermissions;
        const userPermissions = command.userPermissions;

        const embed = new discord.MessageEmbed()
            .setTitle(command)
            .setColor('#0099ff')
            .addField('Summary', command.description.content)
            .addField('Usage',   command.description.usage);

        let exampleStr = '';
        for (let example of command.description.examples) {
            exampleStr += this.handler.prefix + command + ' ' + example + '\n';
        }
        embed.addField('Examples', exampleStr);

        message.channel.send(embed);
    }

    defaultHelp(message) {
        const embed = new discord.MessageEmbed()
            .setTitle('Use help <command> to view parameters and examples.')
            .setColor('#0099ff');

        for (const [category, commands] of this.handler.categories) {
            let valueStr = '';
            for (const cmd of commands) {
                const command = cmd[1];
                valueStr += `${this.handler.prefix}${command.id} - ${command.description.content}\n`;
            }
            embed.addField(category, valueStr);
        }

        message.channel.send(embed);
    }
}

module.exports = HelpCommand
