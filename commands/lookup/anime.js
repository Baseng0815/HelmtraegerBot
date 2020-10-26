const discord = require('discord.js');
const { Command } = require('discord-akairo');

const log = require('../../log.js');
const anilist = require('anilist-node');

class AnimeCommand extends Command {
    constructor() {
        super('anime', {
            aliases: ['anime'],
            args: [
                {
                    id: 'nameOrIndex'
                }
            ],
            description: {
                content: 'Look up an anime using its name, select an index of results and show information.',
                usage: 'anime <name>/<index>',
                examples: [ '"death note"', '"防振り"', '4' ]
            }
        });

        this.resultMap = {};
        this.Anilist = new anilist();
    }

    sendResultMap(message) {
        let result = this.resultMap[message.author.id];

        if (!(result?.length)) {
            message.channel.send('You have to perform a lookup first');
            log.logMessage(`ERROR: user with id '${message.author.id}' has no entry in result map`);
            return;
        }

        // build and send index string
        let indexString = '';
        for (let i = 0; i < result.length; i++) {
            indexString += `${i}:\t${result[i].title.english ?? result[i].title.romaji}\n`;
        }
        message.channel.send(indexString);
    }

    exec(message, args) {
        if (args.nameOrIndex === 'undefined' || args.nameOrIndex === null) {
            // no arguments specified
            this.sendResultMap(message);
            return;
        }

        // try to get an index
        let index = parseInt(args.nameOrIndex);

        if (!isNaN(index)) {
            // index of previous lookup result
            try {
                let animeId = this.resultMap[message.author.id][index].id;
                log.logMessage(`INFORM: anime id: ${animeId}`);
                this.Anilist.media.anime(animeId).then(data => {
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

        } else {
            // we know that nameOrIndex has to be a name, so get results
            this.Anilist.search('anime', args.nameOrIndex).then(data => {
                if (!data.media.length) {
                    message.channel.send('No anime found. Maybe try another search term?');
                    log.logMessage(`ERROR: anime with name '${args.nameOrIndex}' not found or index string building failed`);
                    return;
                }

                this.resultMap[message.author.id] = data.media;
                this.sendResultMap(message);
            });
        }
    }
}

module.exports = AnimeCommand;
