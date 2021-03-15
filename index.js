require('dotenv').config();

const Discord = require('discord.js');
const ytdl = require('ytdl-core');

const bot = new Discord.Client();

const { TOKEN } = process.env;

// Establishing connection
bot.login(TOKEN);

bot.once('ready', () => {
  console.log('Ready!');
});

bot.once('reconnecting', () => {
  console.log('Reconnecting!');
});

bot.once('disconnect', () => {
  console.log('Disconnect!');
});

// Main logic
const prefix = '~';

const queue = new Map();

const parseArgs = (content) => {
  const args = content.slice(prefix.length).trim().split(' ');
  const command = args[0].toLowerCase();
  console.log(`args: ${args}`);
  console.log(`command: ${command}`);

  return { args, command };
};

bot.on('message', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(prefix + 'beach')) {
    message.channel.send('shirt!');
  } else if (message.content.startsWith(prefix + 'entrance')) {
    await entranceMusic(message, serverQueue);
  }
});

const entranceMusic = async (message, serverQueue) => {
  const voiceChannel = message.member.voice.channel;

  if (!voiceChannel) {
    return message.channel.send('You need to be in a voice channel to play music!');
  }

  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
    return message.channel.send('I need the permissions to join and speak in your voice channel!');
  }

  // ---
  const { args, command } = parseArgs(message.content);
  const songUrl = args[1];

  const songInfo = await ytdl.getInfo(songUrl);
  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
  };

  console.log(`Song: ${song.title}`);

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true,
    };

    queue.set(message.guild.id, queueContruct);
    queueContruct.songs.push(song);

    try {
      const connection = await voiceChannel.join();

      queueContruct.connection = connection;

      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);

      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);

    return message.channel.send(`${song.title} added to the queue!`);
  }
};


function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}
