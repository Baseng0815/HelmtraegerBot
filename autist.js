const discord = require('discord.js');
const fs = require('fs');
const path = require('path');

function func(arguments, message) {
    fs.readdir('autist', (err, files) => {
        if (err) {
            console.log('Unable to open the autist folder');
            return;
        }

        // list messages
        if (arguments[0] === 'list') {
            let string = '';
            for (index in files) {
                string += `${index}) ${files[index]}\n`;
            }
            message.channel.send(string);
            return;
            // play specific message
        } else if (arguments.length >= 1) {
            if (files.includes(files[arguments[0]])) {
                var filePath = path.join(__dirname, 'autist', files[arguments[0]]);
            } else {
                message.channel.send(`File ${files[arguments[0]]} not found.`);
                return;
            }
            // play random message
        } else {
            var filePath = path.join(__dirname, 'autist', files[Math.floor(Math.random() * files.length)]);
        }

        if (!filePath) {
            console.log('A file could not be selected');
            return;
        }

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            message.channel.send(`${message.author.toString()}, you have to be in a voice channel for me to join.`);
            return;
        }
        voiceChannel.join().then(connection => {
            console.log(`Playing autist file ${filePath}`);
            connection.play(filePath);
        }).catch(err => console.log(err));
    });
}

meta = {
    doc: {
        description: 'We all love each other and are always friendly',
        fields:
        [
            { name: '!autist', value: 'Hear a message of love' },
            { name: '!autist [list]', value: 'Show messages' },
            { name: '!autist (message)', value: 'Hear a specific message of love' },
        ]
    },
    voice_only: true
};

module.exports = {
    func, meta
};
