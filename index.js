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
const userPreferences = new Map();

const DEFAULT_SONG = {
  title: 'My Rage Knows No Bounds!',
  url: 'https://www.youtube.com/watch?v=TNLPGCCUfnY'
};

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

  console.log('guild id: ' + message.guild.id);
  console.log('\n');

  if (message.content.startsWith(prefix + 'beach')) {
    console.log(message.channel);
    message.channel.send('shirt!');
  } else if (message.content.startsWith(prefix + 'entrance')) {
    checkVoice(message);
    await entranceMusic(message);
  }
});

const checkVoice = (message) => {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    return message.channel.send('You need to be in a voice channel to play music!');
  }

  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
    return message.channel.send('BeachBot doesn\'t have permission to join and speak in this channel!');
  }
}

const entranceMusic = async (message) => {
  const { args, command } = parseArgs(message.content);
  const songUrl = args[1];

  if (!songUrl) return message.channel.send('No YouTube URL to use!');

  const songInfo = await ytdl.getInfo(songUrl);
  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
  };

  console.log(song);

  const user = message.author.id;
  const name = message.author.username;

  userPreferences.set(user, song);

  return message.channel.send(`${name} entrance music set: {${song.title}`);
  // const serverQueue = queue.get(message.guild.id);

  // if (!serverQueue) {
  //   const queueContruct = {
  //     textChannel: message.channel,
  //     voiceChannel: voiceChannel,
  //     connection: null,
  //     songs: [],
  //     volume: 5,
  //     playing: true,
  //   };

  //   queue.set(message.guild.id, queueContruct);
  //   queueContruct.songs.push(song);

  //   try {
  //     const connection = await voiceChannel.join();

  //     queueContruct.connection = connection;

  //     play(message.guild, queueContruct.songs[0]);
  //   } catch (err) {
  //     console.log(err);
  //     queue.delete(message.guild.id);

  //     return message.channel.send(err);
  //   }
  // } else {
  //   serverQueue.songs.push(song);

  //   return message.channel.send(`${song.title} added to the queue!`);
  // }
};

function play(guild, song, connection) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  // const dispatcher = serverQueue.connection
  const dispatcher = connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));

  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}


// bot.on('message', async (message) => {
bot.on('voiceStateUpdate', async (oldState, newState) => {
  console.log('voiceStateUpdate');
  
  const oldChannel = oldState.channelID;
  const newChannel = newState.channelID;
  console.log('voice channel:' + newChannel);
  console.log('\n');

  if (!oldChannel && newChannel) {
    const user = newState.id;
    console.log(`New user joined channel: ${newState.guild.name}`);

    const userSong = userPreferences.get(user) || DEFAULT_SONG;

    try {
      const connection = await newState.channel.join();

      play(newState.guild, userSong, connection);
    } catch (err) {
      console.log(err);
    }
  }
});

  //   // getSongId for User
  //   const songUrl = 'https://www.youtube.com/watch?v=TNLPGCCUfnY';

  //   const songInfo = await ytdl.getInfo(songUrl);
  //   const song = {
  //     title: songInfo.videoDetails.title,
  //     url: songInfo.videoDetails.video_url,
  //   };

  // console.log(`Song: ${song.title}`);

  // const serverQueue = queue.get(newUserState.guild.id);
  // const messageChannel = '';
  
  // if (!serverQueue) {
  //   const queueContruct = {
  //     textChannel: messageChannel,
  //     voiceChannel: newChannel,
  //     connection: null,
  //     songs: [],
  //     volume: 5,
  //     playing: true,
  //   };

  //   queue.set(newUserState.guild.id, queueContruct);
  //   queueContruct.songs.push(song);

  //   try {
  //     const connection = await newUserState.join();

  //     queueContruct.connection = connection;

  //     play(newUserState.guild, queueContruct.songs[0]);
  //   } catch (err) {
  //     console.log(err);
  //     queue.delete(newUserState.guild.id);

  //     // return message.channel.send(err);
  //     return;
  //   }
  // } else {
  //   serverQueue.songs.push(song);

  //   // return message.channel.send(`${song.title} added to the queue!`);
  //   return;
  // }
    // } 

