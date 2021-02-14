const { Command } = require('discord-akairo');

const fs = require('fs');
const log = require('../../log.js');
const path = require('path');

class PastaCommand extends Command {
    constructor() {
        super('pasta', {
            aliases: ['pasta'],
            args: [],
            description: {
                content: 'Only the finest pasta straight from r/copypasta',
                usage: '<>',
                examples: [ '' ]
            },
        });

        log.logMessage('INFORM: Reading pasta file...');
        fs.readFile(path.join(__dirname, '..', '..', 'res', 'pasta', 'pastas.txt'), 'utf8', (err, data) => {
            if (err) {
                log.logMessage(`ERROR: unable to open the pastas folder: ${err}`);
                return;
            }

            this.pastas = data.split('|||').filter(pasta => pasta.length != 0);
            log.logMessage(`INFORM: Loaded ${this.pastas.length} pastas`)
        })
    }

    exec(message, args) {
        let randomIndex = Math.floor(Math.random() * this.pastas.length);
        message.channel.send(this.pastas[randomIndex]);
    }
}

module.exports = PastaCommand
