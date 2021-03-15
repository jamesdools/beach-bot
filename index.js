require('dotenv').config();

const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const db = require('./db');

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

const checkVoice = (message) => {
  const voiceChannel = message.member.voice.channel;

  if (!voiceChannel) {
    return message.channel.send('You need to be in a voice channel to play music!');
  }

  const permissions = voiceChannel.permissionsFor(message.client.user);

  if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
    return message.channel.send("BeachBot doesn't have permission to join and speak in this channel!");
  }
};

const entranceMusic = async (message) => {
  const { args, command } = parseArgs(message.content);
  const songUrl = args[1];

  if (!songUrl) return message.channel.send('No YouTube URL to use!');

  const songInfo = await ytdl.getInfo(songUrl);
  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
  };

  
  const user = message.author.id;
  const name = message.author.username;
  
  console.log(`user: ${user}`);
  console.log(song);
  console.log('Entrance music set');

  await db.save(user, song);

  return message.channel.send(`**${name}**'s entrance now music set: _${song.title}_`);
};

const play = (guild, song) => {
  const serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);

    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on('finish', () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on('error', (error) => console.error(error));

  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

  if (serverQueue.textChannel) {
    serverQueue.textChannel.send(`Now playing: **${song.title}**`);
  }
}

bot.on('message', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  console.log('Guild ID: ' + message.guild.id);

  if (message.content.startsWith(prefix + 'beach')) {
    console.log(message.channel);
    message.channel.send('shirt!');
  } else if (message.content.startsWith(prefix + 'entrance')) {
    checkVoice(message);
    await entranceMusic(message);
  }
});

bot.on('voiceStateUpdate', async (oldState, newState) => {
  console.log('voiceStateUpdate');

  const oldChannel = oldState.channelID;
  const newChannel = newState.channelID;

  if (!oldChannel && newChannel) {
    console.log(`New user joined channel: ${newState.guild.name}`);

    const user = newState.id;
    const { song } = await db.get(user);
    
    if (!song) return; // Do nothing if no song is set

    console.log('Adding song to queue: ', song);

    const serverQueue = queue.get(newState.guild.id);

    if (!serverQueue) {
      const queueContruct = {
        textChannel: '',
        voiceChannel: newState.channel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
      };

      queue.set(newState.guild.id, queueContruct);
      queueContruct.songs.push(song);

      try {
        const connection = await newState.channel.join();
        
        queueContruct.connection = connection;

        play(newState.guild, song, connection);
      } catch (err) {
        console.log(err);
      }
    } else {
        serverQueue.songs.push(song);

        console.log(`${song.title} queued up!`);
    }
  }
});

const init = async () => {
  // await db.save('test-user-id', {
  //   title: 'title',
  //   url: 'https://www.youtube.com/watch?v=WWyI-58gpic'
  // });

  // const result = await db.get('365579546256343060');
  // console.log(result);
}
init();