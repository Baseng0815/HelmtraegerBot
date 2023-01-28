const fs = require('node:fs');
const path = require('node:path')
const { REST, Routes } = require('discord.js');

require('dotenv').config({path: path.join(__dirname, '.env')})

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(process.env.BOT_CLIENT_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
