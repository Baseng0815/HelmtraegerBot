const { Listener } = require('discord-akairo');
const { exec  } = require('child_process');
const fs = require('fs');
const log = require('../log');

class RedditListener extends Listener {
    constructor() {
        super('reddit', {
            emitter: 'client',
            event: 'message'
        });
    }

    exec(message) {
        if (message.content.startsWith('https://www.reddit.com/r/')) {
            log.logMessage(`INFORM: received reddit video link \'${message.content}\', trying to convert and send...`)
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

                        message.channel.send({ files: [ file ] })
                            .then(() => {
                                log.logMessage(`INFORM: video ${file} sent`);
                                message.delete({ timeout: 0 })
                                    .then(msg => log.logMessage(`INFORM: message from user '${msg.author.username}' deleted`));
                                log.logMessage(`INFORM: deleting file ${file}`);
                                fs.unlinkSync(file);
                            })
                            .catch(log.logMessage);
                    });

                } catch (err) {
                    log.logMessage(`ERROR: ${err}`);
                    return;
                }
            });
        }
    }
}

module.exports = RedditListener;
