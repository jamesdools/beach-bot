require('dotenv').config();

const Discord = require("discord.js");
const ytdl = require('ytdl-core');

const bot = new Discord.Client();

const { TOKEN }= process.env;

// Establishing connection
bot.login(TOKEN);

client.once('ready', () => {
  console.log('Ready!');
});

client.once('reconnecting', () => {
  console.log('Reconnecting!');
});

client.once('disconnect', () => {
  console.log('Disconnect!');
});

// Main logic
const prefix = "!beach";
bot.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const { args, command } = getArguments(message.content);

  if (message.content.startsWith(prefix)) {
    message.channel.send('shirt!');
  }

  if (message.content.startsWith(prefix + ' join')) {
    // message.channel.send('');
  }
});