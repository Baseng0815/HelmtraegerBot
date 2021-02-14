const { Command } = require('discord-akairo');
const discord = require('discord.js');
const OpenWeatherMapHelper = require('openweathermap-node');

const log = require('../../log.js');

class WeatherCommand extends Command {
    constructor() {
        super('weather', {
            aliases: ['weather'],
            args: [
                {
                    id: 'city',
                    type: 'string'
                },
                {
                    id: 'what',
                    type: 'string',
                    default: 'current'
                }
            ],
            description: {
                content: 'Get weather information',
                usage: '<city> <what(current)>?',
                examples: [ 'Frankenberg current', 'Frankfurt' ]
            }
        });

        this.helper = new OpenWeatherMapHelper({
            APPID: process.env.WEATHER_KEY,
            units: 'metric'
        });
    }

    exec(message, args) {
        switch (args.what) {
            case 'current':
                this.helper.getCurrentWeatherByCityName(args.city, (err, data) => {
                    if (err) {
                        log.logMessage(`ERROR: at current weather: ${err}`);
                        message.channel.send(`Could not get weather information: ${err}`);
                        return;
                    }

                    const sunriseDate = new Date(data.sys.sunrise * 1000);
                    const sunsetDate = new Date(data.sys.sunset * 1000);
                    let diffToRise = Math.round((sunriseDate - Date.now()) / 1000);
                    let diffToSet = Math.round((sunsetDate - Date.now()) / 1000);

                    const sunrise = `${sunriseDate.getHours()}:${sunriseDate.getMinutes() < 10 ?
                            '0' + sunriseDate.getMinutes() : sunriseDate.getMinutes()}`;
                    const sunset = `${sunsetDate.getHours()}:${sunsetDate.getMinutes() < 10 ?
                            '0' + sunsetDate.getMinutes() : sunsetDate.getMinutes()}`;

                    if (diffToRise < 0) { diffToRise += 3600 * 24; }
                    if (diffToSet < 0) { diffToSet += 3600 * 24; }

                    let minutes = Math.round(diffToRise % 3600 / 60);
                    const toSunrise = `${Math.floor(diffToRise / 3600)}:${minutes < 10 ?
                            '0' + minutes : minutes}`;

                    minutes = Math.round(diffToSet % 3600 / 60);
                    const toSunset = `${Math.floor(diffToSet / 3600)}:${minutes < 10 ?
                            '0' + minutes : minutes}`;

                    const embed = new discord.MessageEmbed()
                        .setTitle('Weather')
                        .setColor('#9f9e76')
                        .addField(`Current Weather for ${args.city}`,
                            `lat/lon: ${data.coord.lat}/${data.coord.lon}
                            Forecast: ${data.weather[0].description}
                            Temperature: ${data.main.temp}°C
                            Feels like ${data.main.feels_like}°C
                            Between ${data.main.temp_min}°C and ${data.main.temp_max}°C
                            Pressure: ${data.main.pressure}hPa
                            Humidity: ${data.main.humidity}%
                            Wind: ${data.wind.speed}m/s from ${data.wind.deg}
                            Sunrise: ${sunrise} (next in ${toSunrise})
                            Sunset: ${sunset} (next in ${toSunset})
                            `);

                    message.channel.send(embed);
                });
                break;
        }
    }
}

module.exports = WeatherCommand;
