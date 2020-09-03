const discord = require('discord.js');
const fs = require('fs');
const path = require('path');

function manCommand(arguments, message) {
    const argument = arguments[0];
    if (arguments.length == 0) {
        message.channel.send('I\'m not sure what you need help with. Try \`!man [topic]\`');
    } else {
        const manual = manualData[argument];

        if (typeof manual != 'undefined') {
            let embed = new discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`man ${argument}`)
                .attachFiles('./roofus.jpeg')
                .setAuthor('HelmträgerBot', 'attachment://roofus.jpeg')
                .setDescription(manual.description)
                .addFields(manual.fields);

            message.channel.send(embed);
        } else {
            message.channel.send(`Manual page for ${argument} does not exist.`);
        }
    }
}

function autistCommand(arguments, message) {
    fs.readdir('autist', (err, files) => {
        if (err) {
            console.log('Unable to open the autist folder');
            return;
        }

        // list messages
        if (arguments[0] == 'list') {
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

function leaveCommand(arguments, message) {
    const userChannel = message.member.voice.channel;
    const botChannel = message.guild.voice.channel;
    if (userChannel == botChannel && userChannel) {
        botChannel.leave();
    }
}

const manualData = {
    man:
    { description: 'Get information about a command / an action',
        fields:
        [
            { name: '!man [topic]', value: 'Get information about [topic]' }
        ]
    },
    autist:
    { description: 'We all love each other and are always friendly',
        fields:
        [
            { name: '!autist', value: 'Hear a message of love' },
            { name: '!autist [list]', value: 'Show messages' },
            { name: '!autist [message]', value: 'Hear a specific message of love' },
        ]
    },
    leave:
    { description: 'Leave the voice channel',
        fields:
        [
            { name: '!leave', value: 'Leave the current voice channel' },
        ]
    },
    ping:
    { description: 'Write back pong. Sometimes useful for debugging.',
        fields:
        [
            { name: '!ping', value: 'Get \'pong\' as a response.' }
        ]
    },
};

const commands = { man: {command: manCommand, guild_only: false}, autist: {command: autistCommand, guild_only: true}, leave: {command: leaveCommand, guild_only: true }};

module.exports.commands = commands;
