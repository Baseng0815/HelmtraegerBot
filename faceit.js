const discord = require('discord.js');
const https = require('https');

function func(arguments, message) {
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

meta = {
    doc: {
        description: 'Look up faceit information',
        fields:
        [
            { name: '!faceit (nickname)', value: 'Get player information' }
        ]
    },
    voice_only: false
};

module.exports = {
    func, meta
};
