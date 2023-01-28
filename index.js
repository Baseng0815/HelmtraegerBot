const fs = require('node:fs')
const path = require('node:path')
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js')

require('dotenv').config({path: path.join(__dirname, '.env')})

const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('js'))

const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('js'))

const client = new Client({intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates
]})
client.commands = new Collection()

// register commands
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command)
        console.log(`Registered command ${command.data.name}`)
    } else {
        console.error(`Warning: the command at ${filePath} is missing a required property`)
    }
}

// register events
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file)
    const event = require(filePath)
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args))
    } else {
        client.on(event.name, (...args) => event.execute(...args))
    }
}

client.login(process.env.BOT_TOKEN)
