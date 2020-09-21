const discord = require('discord.js');
const commands = require('./commands')
const fs = require('fs');

const client = new discord.Client();

require('dotenv').config();

async function tonsOfMessages(channel, limit = 500) {
    let sum_messages = [];
    let last_id;

    while (true) {
        const options = { limit: 100 };
        if (last_id) {
            options.before = last_id;
        }

        const messages = await channel.messages.fetch(options);
        sum_messages = sum_messages.concat(messages.array());
        console.log(sum_messages.length);
        last_id = messages.last().id;

        if (messages.size != 100 || sum_messages.length >= limit) {
            break;
        }
    }

    return sum_messages;
}

client.on('ready', () => {
    console.log("Connected as " + client.user.tag);

    client.user.setActivity('Nekopara Vol. 0', {type: 'PLAYING'});
});

client.on('message', message => {
    if (message.author != client.user) {
        if (message.content.startsWith('!')) {
            processCommand(message);
        }
    }
});

function processCommand(message) {
    const fullCommand = message.content.substr(1);
    const splitCommand = fullCommand.split(' ');
    const primaryCommand = splitCommand[0];
    const arguments = splitCommand.slice(1);

    const command = commands.commands[primaryCommand];
    if (command) {
        if (message.channel.type !== 'voice') {
            if (command.voice_only) {
                message.channel.send(`Command ${primaryCommand} is voice only.`);
                return;
            }
        }
        command.command(arguments, message);
    } else {
        message.channel.send(`Command ${primaryCommand} not found.`);
    }
}

client.login(process.env.TOKEN);
