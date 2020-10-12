const discord = require('discord.js');

const leave = require('./leave.js');
const autist = require('./autist.js');
const faceit = require('./faceit.js');
const anime = require('./anime.js');

const manualData = { leave, autist, faceit, anime }

function func(arguments, message) {
    const argument = arguments[0];
    if (arguments.length == 0) {
        message.channel.send('I\'m not sure what you need help with. Try \`!man (topic)\`. Available commands are:');
        let str = '';
        for (manual in manualData) {
            str += `\`!${manual}\`\n`
        }
        message.channel.send(str);
    } else {
        let manual = manualData[argument]?.meta;
        if (argument == 'man') {
            manual = meta;
        }

        console.log(manualData);
        console.log(manual);
        console.log(argument);

        if (manual) {
            let embed = new discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`man ${argument}`)
                .attachFiles('./roofus.jpeg')
                .setAuthor('HelmträgerBot', 'attachment://roofus.jpeg')
                .setDescription(manual.doc.description)
                .addFields(manual.doc.fields);

            message.channel.send(embed);
        } else {
            message.channel.send(`Manual page for ${argument} does not exist.`);
        }
    }
}

meta = {
    doc: {
        description: 'Look up faceit information',
        fields:
        [
            { name: '!man (topic)', value: 'Get information about (topic). Subcommands are marked with [] and arguments with ().' }
        ]

    },
    voice_only: false
};

module.exports = {
    func, meta
};
