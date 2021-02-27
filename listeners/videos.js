const { Listener } = require('discord-akairo');
const { exec  } = require('child_process');
const fs = require('fs');
const log = require('../log');

class VideosListener extends Listener {
    constructor() {
        super('videos', {
            emitter: 'client',
            event: 'message'
        });

        this.regexes = [ new RegExp('.*reddit.com/r/.*/comments'),
            new RegExp('.*instagram.com/p/.*'),
            new RegExp('.*twitter.com/.*/status/.*')]
    }

    exec(message) {
        for (let regex of this.regexes) {
            if (regex.test(message.content)) {
                log.logMessage(`INFORM: received video link \'${message.content}\', trying to convert and send...`)
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
                            // TODO take upload limit boosts into account
                            if (fileSizeInM >= 7.9) {
                                // video can't be uploaded to discord; upload to YouTube cause the preview works quite nice
                                log.logMessage('ERROR: video is larger than 8MB, won\'t send to Discord.')
                                message.channel.send('Video is larger than 8MB!');
                                // This thing is useless because you can't upload public videos to YouTube unless you are verified. Too bad!
                                // service.videos.insert(
                                //     {
                                //         auth: oauthClient.auth,
                                //         part: 'snippet,contentDetails,status',
                                //         resource: {
                                //             snippet: {
                                //                 title: 'autoupload',
                                //                 description: 'autodesc'
                                //             },
                                //             status: {
                                //                 privacyStatus: 'unlisted'
                                //             }
                                //         },
                                //         media: {
                                //             body: fs.createReadStream(file)
                                //         }
                                //     }, (error, data) => {
                                //         if (error) {
                                //             log.logMessage(`ERROR: ${error}`);
                                //             return;
                                //         }

                                //         log.logMessage(`INFORM: video ${file} sent to YouTube`);
                                //         log.logMessage(`INFORM: video id ${data.data.id}`);
                                //         message.channel.send(`https://www.youtube.com/watch?v=${data.data.id}`)
                                //             .then(() => {
                                //                 message.delete({ timeout: 0 })
                                //                     .then(msg => log.logMessage(`INFORM: message from user '${msg.author.username}' deleted`));
                                //             }).catch(log.logMessage);
                                //     }
                                // )
                            } else {
                                // video can be uploaded to discord
                                message.channel.send({ files: [ file ] })
                                    .then(() => {
                                        log.logMessage(`INFORM: video ${file} sent to Discord`);
                                        message.delete({ timeout: 0 })
                                            .then(msg => log.logMessage(`INFORM: message from user '${msg.author.username}' deleted`));
                                    }) .catch(log.logMessage);
                            }

                        });

                    } catch (err) {
                        log.logMessage(`ERROR: ${err}`);
                        return;
                    }
                });
            }
        }
    }
}

module.exports = VideosListener;
