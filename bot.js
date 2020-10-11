const discord = require('discord.js');
const commands = require('./commands.js')
const fs = require('fs');
const log = require('./log.js');
const { exec } = require('child_process');

const client = new discord.Client();

require('dotenv').config();

client.on('ready', () => {
    log.logMessage(`INFORM: connected as ${client.user.tag}`);

    client.user.setActivity('Nekopara Vol. 0', {type: 'PLAYING'});
});

client.on('message', message => {
    if (message.author != client.user) {
        if (message.content.startsWith('!')) {
            processCommand(message);
        } else {
            processMessage(message);
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
        if (message.member.voice.channel?.type !== 'voice') {
            if (command.meta.voice_only) {
                log.logMessage(`ERROR: command ${primaryCommand} is voice only`);
                message.channel.send(`Command ${primaryCommand} is voice only.`);
                return;
            }
        }
        log.logMessage(`INFORM: process command '${primaryCommand}' from user '${message.author.username}'`);
        command.func(arguments, message);
    } else {
        log.logMessage(`ERROR: command ${primaryCommand} not found`);
        message.channel.send(`Command ${primaryCommand} not found.`);
    }
}

function processMessage(message) {
    if (message.content.startsWith('https://www.reddit.com/r/')) {
        // first, get video info
        exec('youtube-dl --dump-json ' + message.content, (error, stdout, stderr) => {
            if (error) {
                log.logMessage(`ERROR: in getting video metadata: ${error.message}`);
                return;
            }
            if (stderr) {
                log.logMessage(`ERROR: in getting video metadata: ${stderr}`);
                return;
            }

            try {
                const info = JSON.parse(stdout);
                const file = '/tmp/' + info.id + '.mp4';
                // download video
                exec(`youtube-dl -o ${file} ${message.content}`, (error, stdout, stderr) => {
                    if (error) {
                        log.logMessage(`ERROR: in downloading video to ${file}: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        log.logMessage(`ERROR: in downloading video to ${file}: ${stderr}`);
                        return;
                    }

                    const stats = fs.statSync(file);
                    const fileSizeInM = stats.size / 1000000.0
                    if (fileSizeInM >= 7.8) {
                        log.logMessage('ERROR: video is larger than 8MB, won\'t send.')
                        message.channel.send('Video is larger than 8MB, sorry!');
                        return;
                    }

                    message.channel.send({ files: [ file ] });
                    log.logMessage(`INFORM: video ${file} sent`);
                    message.delete({ timeout: 0 })
                        .then(msg => log.logMessage(`INFORM: message from user '${msg.author.username}' deleted`));
                });

            } catch (err) {
                log.logMessage(`ERROR: ${err}`);
                return;
            }
        });
    }
}

client.login(process.env.TOKEN);
