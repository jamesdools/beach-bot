require('dotenv').config();

const Discord = require('discord.js');
const db = require('./db');
const { play, handleEntrance, registerMusic } = require('./music');

const bot = new Discord.Client();
const { TOKEN } = process.env;


const prefix = '~';

const helpScreen = {
  color: '#fed049',
  title: 'BeachBot commands',
  author: {
    name: '',
    url: 'https://github.com/jamesdools/beach-bot',
  },
  description: 'Everyone deserves entrance music.',
  fields: [
    {
      name: '\u200B',
      value: '━━━━',
    },
    {
      name: '`~entrance` \t url \t start \t end',
      value: 'Set your entrance music for when you enter a voice channel.',
    },
    {
      name: 'Example usage:',
      value: '`~entrance https://www.youtube.com/watch?v=TzaVd6zl2bA 1:20 1:36`'
    },
    {
      name: 'url',
      value: 'Must be a valid YouTube link.' + 
      '\nTip: _add < > around url to stop the video preview from showing in the channel._',
    },
    {
      name: 'start / end',
      value: 'Both optional. If given, must be a valid timestamp, eg. 0:25 or 2:21.',
    },
    {
      name: '\u200B',
      value: '━━━━',
    },
    {
      name: '`~entrance` \t **on** | **off**',
      value: 'Enable or disable entrance music.',
    },
  ],
  image: {
    url: 'https://media.tenor.com/images/057161e766253130ca174e0b3740c0cd/tenor.gif',
  }
};

const updateSettings = async (message, entranceMusicIsOn) => {
    const user = message.author.id;
    const name = message.author.username;
    const userSettings = await db.get(user);

    if (!userSettings) {
      return message.channel.send('You haven\'t registered any entrance music!'); 
    }

    await db.saveSetting(user, entranceMusicIsOn);

    const result = entranceMusicIsOn ? 'enabled' : 'disabled';
    message.channel.send(`Entrance music for **${name}** ${result}.`);
}

// Establishing connection
bot.login(TOKEN);

bot.once('ready', () => {
  console.log('BeachBot is ready! 🤘 👕 🏖');
});

bot.once('reconnecting', () => {
  console.log('Reconnecting!');
});

bot.once('disconnect', () => {
  console.log('Disconnect!');
});


bot.on('message', async (message) => {
  if (message.author.bot) return;

  if (!message.content.startsWith(prefix)) return;

  if (message.content.startsWith(prefix + 'beach')) {
    return message.channel.send('shirt!'); 
  } 
  
  if (message.content.startsWith(prefix + 'help')) {
    return message.channel.send({ embed: helpScreen });
  }
  
  // Entrance commands
  if (message.content === prefix + 'entrance on') {
    await updateSettings(message, true);
  } else if (message.content === prefix + 'entrance off') {
    await updateSettings(message, false);
  } else if (message.content.startsWith(prefix + 'entrance')) {
    await registerMusic(message);
  }
});

bot.on('voiceStateUpdate', async (oldState, newState) => {
  const oldChannel = oldState.channelID;
  const newChannel = newState.channelID;

  const name = newState.member.user.username;
  const isBot = newState.member.user.bot;

  if (isBot) return;
  
  if (!oldChannel && newChannel) {
    console.log(`User joined channel: ${name}`);

    await handleEntrance(newState);
  } else if (oldChannel && !newChannel) {
    // TODO: Switching between channels
    // TODO: exit music?
    console.log(`User left the channel: ${name}`);
  }
});
