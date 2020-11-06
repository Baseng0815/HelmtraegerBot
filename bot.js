const { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } = require('discord-akairo');

require('dotenv').config();

class MyClient extends AkairoClient {
    constructor() {
        super({
            ownerID: '233599437635584000'
        }, {
            disableMentions: 'everyone'
        });

        this.commandHandler = new CommandHandler(this, {
            // options for the command handler
            directory: './commands/',
            prefix: '.',
            automateCategories: true
        });

        this.inhibitorHandler = new InhibitorHandler(this, {
            // options for the listener handler
            directory: './inhibitors/',
        });

        this.listenerHandler = new ListenerHandler(this, {
            // options for the listener handler
            directory: './listeners/',
        });

        this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
        this.commandHandler.useListenerHandler(this.listenerHandler);

        this.inhibitorHandler.loadAll();
        this.listenerHandler.loadAll();
        this.commandHandler.loadAll();
    }
}

const client = new MyClient();

client.login(process.env.TOKEN);

// client.on('ready', () => {
//     log.logMessage(`INFORM: connected as ${client.user.tag}`);

//     client.user.setActivity('Nekopara Vol. 0', {type: 'PLAYING'});
// });

// client.on('message', message => {
//     if (message.author != client.user) {
//         if (message.content.startsWith('!')) {
//             processCommand(message);
//         } else {
//             processMessage(message);
//         }
//     }
// });

// function processCommand(message) {
//     const fullCommand = message.content.substr(1);
//     const splitCommand = fullCommand.split(' ');
//     const primaryCommand = splitCommand[0];
//     const arguments = splitCommand.slice(1);

//     const command = commands[primaryCommand];
//     if (command) {
//         if (message.member.voice.channel?.type !== 'voice') {
//             if (command.meta.voice_only) {
//                 log.logMessage(`ERROR: command ${primaryCommand} is voice only`);
//                 message.channel.send(`Command ${primaryCommand} is voice only.`);
//                 return;
//             }
//         }
//         log.logMessage(`INFORM: process command '${primaryCommand}' from user '${message.author.username}'`);
//         command.func(arguments, message);
//     } else {
//         log.logMessage(`ERROR: command ${primaryCommand} not found`);
//         message.channel.send(`Command ${primaryCommand} not found.`);
//     }
// }

