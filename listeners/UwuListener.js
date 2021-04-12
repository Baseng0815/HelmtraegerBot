const { Listener } = require('discord-akairo');
const { Uwuifier } = require('uwuifier');

class UwuListener extends Listener {
    constructor() {
        super('uwu', {
            emitter: 'client',
            event: 'message'
        });

        this.enabledIds = [ ];
    }

    exec(message) {
        if (this.enabledIds.includes(message.author.id)) {
        }
    }
}

module.exports = UwuListener;
