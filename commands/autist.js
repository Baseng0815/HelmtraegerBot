const { SlashCommandBuilder } = require('discord.js')
const { joinVoiceChannel, createAudioPlayer,
    createAudioResource } = require('@discordjs/voice')

const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, '..', 'res', 'autist');
try {
    var files = fs.readdirSync(basePath)
} catch (err) {
    console.error(`Unable to open the autist folder: ${err}`);
    return;
}

async function play(interaction) {
    // play sound file
    // first, check if user is in voice channel
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
        interaction.reply({content: 'You have to be in a voice channel for me to join.', ephemeral: true});
        return;
    }

    let filePath = interaction.options.getString('file')

    if (!filePath) {
        // play random message
        filePath = path.join(basePath, files[Math.floor(Math.random() * files.length)])
    }

    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guildId,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        selfDeaf: false
    })

    const audioPlayer = createAudioPlayer()
    connection.subscribe(audioPlayer)
    interaction.reply(`Playing autist file \`${path.basename(filePath)}\``);
    audioPlayer.play(createAudioResource(fs.createReadStream(filePath)))
}

module.exports = {
    data: new SlashCommandBuilder()
    .setName('autist')
    .setDescription('Play some nice sounds')
    .addStringOption(option => option
        .setName('file')
        .setDescription('The file to play, leave empty for random')
        .addChoices(...files.reduce((acc, file) => [...acc, { name: file, value: path.join(basePath, file) }], []))),
    async execute(interaction) {
        await play(interaction)
    }
}
