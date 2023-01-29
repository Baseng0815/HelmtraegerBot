const { SlashCommandBuilder } = require('discord.js')

const fs = require('fs');
const path = require('path');

const roasts = fs.readFileSync(path.join(__dirname, '..', 'res', 'roasts.txt')).toString().split('\n')
console.log(`Loaded ${roasts.length} roasts`)

module.exports = {
    data: new SlashCommandBuilder()
    .setName('roast')
    .setDescription('Send some kind words')
    .addUserOption(option => option
        .setName('user')
        .setDescription('The targeted user')),
    async execute(interaction) {
        const randomIndex = Math.floor(Math.random() * roasts.length)
        const userToRoast = interaction.options.getUser('user')
        await interaction.reply(`${userToRoast}, ${roasts[randomIndex]}`)
    }
}
