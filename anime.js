const discord = require('discord.js');
const anilist = require('anilist-node');
const log = require('./log.js');
const fs = require('fs');

const Anilist = new anilist();

let resultMap = {};

function func(arguments, message) {
    if (arguments.length < 1) {
        message.channel.send('You need to specify arguments.');
        log.logMessage('ERROR: no arguments specified');
        return;
    }

    // index of previous lookup result
    let index = parseInt(arguments[0]);
    if (index >= 0) {
        try {
            let animeId = resultMap[message.author.id][index].id;
            log.logMessage(`INFORM: anime id: ${animeId}`);
            Anilist.media.anime(animeId).then(data => {
                // create embed and send data
                let embed = new discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setThumbnail(data.coverImage.large)
                    .addFields([{ name: 'English title', value: data.title.english ?? data.title.romaji },
                        { name: 'Japanese title', value: data.title.native ?? data.title.romaji },
                        { name: 'Status', value: data.status },
                        { name: 'Genres', value: data.genres.join(', ')},
                        { name: 'Rating', value: data.averageScore / 10},
                        { name: 'Episodes', value: data.episodes },
                        { name: 'Episode duration', value: `${data.duration}min`},
                        { name: 'Start date', value: `${data.startDate.year}/${data.startDate.month}/${data.startDate.day}` },
                        { name: 'End date', value: `${data.endDate.year}/${data.endDate.month}/${data.endDate.day}` },
                        { name: 'Season', value: `${data.season} ${data.seasonYear}`},
                        { name: 'Format', value: data.format }
                    ]);

                message.channel.send(embed);
            })
        } catch (e) {
            message.channel.send('Something went wrong. Make sure to look up an anime and then supply a valid index!');
            log.logMessage(`ERROR: couldn't look up anime id; ${e}`);
            return;
        }

        // get results
    } else {
        Anilist.search('anime', arguments.join(' '), 0, 20).then(data => {
            let indexString = '';
            for (let i = 0; i < data.media.length; i++) {
                indexString += `${i}:\t${data.media[i].title.english ?? data.media[i].title.romaji}\n`;
            }

            if (indexString.length) {
                resultMap[message.author.id] = data.media;
                message.channel.send(indexString);
            } else {
                message.channel.send('No anime found. Maybe try another search term?');
                log.logMessage(`ERROR: anime with name '${arguments.join(' ')}' not found or index string building failed`);
            }
        });
    }
}

meta = {
    doc: {
        description: 'Anime lookup',
        fields:
        [
            { name: '!anime (name)', value: 'Look up anime based on name' },
            { name: '!anime (index)', value: 'List anime information based on previous lookup' },
        ]
    },
    voice_only: false
};

module.exports = {
    func, meta
};
