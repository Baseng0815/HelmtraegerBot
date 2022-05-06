const { Listener } = require('discord-akairo');
const { exec  } = require('child_process');
const fs = require('fs');
const log = require('../log');
const YTDlpWrap = require('yt-dlp-wrap').default;

class VideosListener extends Listener {
    constructor() {
        super('videos', {
            emitter: 'client',
            event: 'message'
        });

        this.regexes = [ new RegExp('^.*reddit.com/r/.*/comments/.*/.*/$'),
            new RegExp('^.*instagram.com/p/.*$'),
            new RegExp('^.*twitter.com/.*/status/.*$')]

        this.ytDlpWrap = new YTDlpWrap('/home/pi/.local/bin/yt-dlp');
    }

    exec(message) {
        for (let regex of this.regexes) {
            if (regex.test(message.content)) {
                log.logMessage(`INFORM: received video link \'${message.content}\', trying to convert and send...`)
                // first, get video info
                this.ytDlpWrap.getVideoInfo(message.content).then(metadata => {
                    log.logMessage('INFORM: received metadata for video');
                    try {
                        const file = '/tmp/' + metadata.id + '.mp4';
                        // download video
                        this.ytDlpWrap.execPromise([
                            message.content,
                            '-o',
                            file
                        ]).then(downloadResult => {
                            log.logMessage(`INFORM: downloaded video with result ${downloadResult}`);
                            const stats = fs.statSync(file);
                            const fileSizeInM = stats.size / 1000000.0
                            // TODO take upload limit boosts into account
                            if (fileSizeInM >= 7.9) {
                                log.logMessage('ERROR: video is larger than 8MB, won\'t send to Discord.')
                                message.channel.send('Video is larger than 8MB!');
                            } else {
                                // video can be uploaded to discord
                                message.channel.send({ files: [ file ] })
                                    .then(() => {
                                        log.logMessage(`INFORM: video ${file} sent to Discord`);
                                        message.delete({ timeout: 0 })
                                            .then(msg => log.logMessage(`INFORM: message from user '${msg.author.username}' deleted`));
                                    }) .catch(log.logMessage);
                            }
                        }, error => {
                            log.logMessage(`ERROR: in downloading video to ${file}: ${error.message}`);
                        });
                    } catch (err) {
                        log.logMessage(`ERROR: ${err}`);
                        return;
                    }
                }, error => {
                    log.logMessage(`ERROR: failed to download metadata: ${error.message}`)
                });
            }
        }
    }
}

module.exports = VideosListener;
