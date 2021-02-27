const { Listener } = require('discord-akairo');
const { Uwuifier } = require('uwuifier');

class UwuListener extends Listener {
    constructor() {
        super('uwu', {
            emitter: 'client',
            event: 'message'
        });

        this.enabledIds = ['233599437635584000', '301483896711938049'];
        this.uwuifier = new Uwuifier();
    }

    exec(message) {
        if (this.enabledIds.includes(message.author.id)) {
            let uwu = this.uwuifier.uwuifySentence(message.content);
            message.channel.send(uwu);
        }
    }
}

module.exports = UwuListener;
