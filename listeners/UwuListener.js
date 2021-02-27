const { Listener } = require('discord-akairo');
const { Uwuifier } = require('uwuifier');

class UwuListener extends Listener {
    constructor() {
        super('uwu', {
            emitter: 'client',
            event: 'message'
        });

        this.enabledIds = ['233599437635584000', '301483896711938049'];
        this.uwus = [
            // this bad boi will make wwwwwwwwww and nyyyyyyy
            new Uwuifier({
                spaces: {
                    faces: 0,
                    actions: 0,
                    stutters: 0.4
                },
                exclamations: 0,
                words: 1
            }),
            // this guy will run last and add some nice other effects *notices bulge*
            new Uwuifier({
                spaces: {
                    faces: 0.2,
                    actions: 0.07,
                    stutters: 0
                },
                exclamations: 1,
                words: 1
            })
        ];
    }

    exec(message) {
        if (this.enabledIds.includes(message.author.id)) {
            console.log("GOT MSG: " + message.content);
            let maxUwu = message.content;
            for (let uwu of this.uwus) {
                console.log('a');
                maxUwu = uwu.uwuifySentence(maxUwu);
            }
            message.channel.send(maxUwu);
        }
    }
}

module.exports = UwuListener;
