const { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } = require('discord-akairo');

require('dotenv').config({path: __dirname + '/.credentials/.env'});

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

client.login(process.env.BOT_TOKEN);
