const discord = require('discord.js');
const { Command, Argument } = require('discord-akairo');

const fs = require('fs');
const log = require('../../log.js');
const path = require('path');

const basePath = path.join(__dirname, '..', '..', 'res', 'autist');

class AutistCommand extends Command {
    constructor() {
        super('autist', {
            aliases: ['autist'],
            args: [
                {
                    id: 'indexOrSubcommand'
                }
            ],
            description: {
                content: 'Play some nice sounds',
                usage: '<list>/<index>?',
                examples: [ 'list', '3', '' ]
            },
        });
        fs.readdir(basePath, (err, files) => {
            if (err) {
                log.logMessage(`ERROR: unable to open the autist folder: ${err}`);
                return;
            }

            this.files = files;
        });
    }

    async exec(message, args) {
        if (args.indexOrSubcommand === 'list') {
            // list messages
            let string = '';
            for (let index in this.files) {
                string += `${index}) ${this.files[index]}\n`;
            }
            message.channel.send(string);
            return;
        } else {
            // play sound file
            // first, check if user is in voice channel
            const voiceChannel = message.member.voice.channel;
            if (!voiceChannel) {
                message.channel.send(`${message.author.toString()}, you have to be in a voice channel for me to join.`);
                return;
            }

            let index = parseInt(args.indexOrSubcommand);

            if (this.files.includes(this.files[index])) {
                // play specific message
                var filePath = path.join(basePath, this.files[index]);
            } else {
                // play random message
                log.logMessage(`INFORM: file ${this.files[index]} not found; reverting to random message`)
                var filePath = path.join(basePath, this.files[Math.floor(Math.random() * this.files.length)]);
            }

            // join and play
            voiceChannel.join().then(connection => {
                log.logMessage(`INFORM: playing autist file ${filePath}`);
                connection.play(filePath);
            }).catch(err => console.log(err));
        }
    }
}

module.exports = AutistCommand;
