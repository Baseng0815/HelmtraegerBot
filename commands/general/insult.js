const { Command } = require('discord-akairo');

const fs = require('fs');
const log = require('../../log.js');
const path = require('path');

class RoastCommand extends Command {
    constructor() {
        super('roast', {
            aliases: ['roast'],
            args: [
                {
                    id: 'user',
                    type: 'user'
                }
            ],
            description: {
                content: 'Roast someone',
                usage: '<user>/<>',
                examples: [ '@Roofussprenger69', '' ]
            },
        });

        log.logMessage('INFORM: Reading roast file...');
        fs.readFile(path.join(__dirname, '..', '..', 'res', 'roast', 'roasts.txt'), 'utf8', (err, data) => {
            if (err) {
                log.logMessage(`ERROR: unable to open the roast folder: ${err}`);
                return;
            }

            this.roasts = data.split('\n');
            log.logMessage(`INFORM: Loaded ${this.roasts.length} roasts`)
        })
    }

    exec(message, args) {
        const userToRoast = message.guild.members.cache.get(args.user.id);
        let randomIndex = Math.floor(Math.random() * this.roasts.length);
        message.channel.send(userToRoast.toString() + ', ' + this.roasts[randomIndex]);
    }
}

module.exports = RoastCommand
