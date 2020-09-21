const discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const https = require('https');

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

function leaveCommand(arguments, message) {
    const userChannel = message.member.voice.channel;
    const botChannel = message.guild.voice.channel;
    if (userChannel == botChannel && userChannel) {
        botChannel.leave();
    }
}

function faceitCommand(arguments, message) {
    if (!arguments[0]) {
        message.channel.send('You need to supply a name for me to look up.');
        return;
    }

    const options = {
        method: 'GET',
        hostname: 'open.faceit.com',
        path: `/data/v4/players?nickname=${arguments[0]}`,
        headers: {
            'Authorization': `Bearer ${process.env.FACEIT_KEY}`
        }
    };

    let response = '';
    // query basic information as well as player id
    const req = https.request(options, res => {
        res.setEncoding('utf8');
        res.on('data', chunk => {
            response += chunk;
        });

        res.on('end', () => {
            if (res.statusCode === 404) {
                message.channel.send('Something went wrong. Try looking for another user or try again again later.');
                console.log(`ERROR: status ${res.statusCode}`);
                return;
            }

            response = JSON.parse(response);

            if (!('csgo' in response.games)) {
                message.channel.send('User does not seem to have played CS:GO.');
                return;
            }

            const steam_nick = response.steam_nickname;
            const region = response.games.csgo.region;
            const skill = response.games.csgo.skill_level;
            const elo = response.games.csgo.faceit_elo;

            const statoptions = {
                method: 'GET',
                hostname: 'open.faceit.com',
                path: `/data/v4/players/${response.player_id}/stats/csgo`,
                headers: {
                    'Authorization': `Bearer ${process.env.FACEIT_KEY}`
                }
            };

            // query more details

            let statresponse = '';
            const statreq = https.request(statoptions, statres => {
                statres.setEncoding('utf8');
                statres.on('data', chunk => {
                    statresponse += chunk;
                });

                statres.on('end', () => {
                    if (statres.statusCode === 404) {
                        console.log(`ERROR: status ${statres.statusCode}`);
                        message.channel.send('Something went wrong. Try looking for another user or try again again later.');
                        return;
                    }

                    statresponse = JSON.parse(statresponse);

                    let hist = '';
                    for (game of statresponse.lifetime['Recent Results']) {
                        if (game == '1')
                            hist += 'W';
                        else
                            hist += 'L';
                    }

                    let embed = new discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setAuthor(arguments[0], response.avatar)
                        .addFields([{ name: 'Steam nickname:', value: steam_nick },
                            { name: 'Region', value: region },
                            { name: 'Skill level', value: skill },
                            { name: 'FaceIt ELO', value: elo },
                            { name: 'Win', value: `${statresponse.lifetime['Win Rate %']}% (${statresponse.lifetime['Wins']}/${statresponse.lifetime['Matches']})` },
                            { name: 'Headshot %', value: statresponse.lifetime['Average Headshots %'] },
                            { name: 'K/D Ratio', value: statresponse.lifetime['Average K/D Ratio'] },
                            { name: 'Recent Games', value: hist }
                        ]);

                    message.channel.send(embed);
                });
            });

            statreq.on('error', e => {
                console.log(`ERROR: ${e.message}`);
                message.channel.send('Something went wrong.');
                return;
            });

            statreq.end();
        });
    });

    req.on('error', (e) => {
        console.log(`ERROR: ${e.message}`);
        message.channel.send('Something went wrong.');
        return;
    });

    req.end();
}

const manualData = {
    man:
    { description: 'Get information about a command / an action',
        fields:
        [
            { name: '!man (topic)', value: 'Get information about (topic). Subcommands are marked with [] and arguments with ().' }
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
    faceit:
    { description: 'Look up faceit information',
        fields:
        [
            { name: '!faceit (nickname)', value: 'Get player information' }
        ]
    },

    ping:
    { description: 'Write back pong. Useful for debugging.',
        fields:
        [
            { name: '!ping', value: 'Get \'pong\' as a response.' }
        ]
    },
};

const commands = { man: {command: manCommand, voice_only: false}, autist: {command: autistCommand, voice_only: true},
    leave: {command: leaveCommand, voice_only: true }, faceit: {command: faceitCommand, voice_only: false}};

module.exports.commands = commands;
