const discord = require('discord.js');

function func(arguments, message) {
    const userChannel = message.member.voice.channel;
    const botChannel = message.guild.voice.channel;
    if (userChannel == botChannel && userChannel) {
        botChannel.leave();
    }
}

meta = {
    doc: {
        description: 'Leave the voice channel',
        fields:
        [
            { name: '!leave', value: 'Leave the current voice channel' },
        ]
    },
    voice_only: false
};

module.exports = {
    func, meta
};
