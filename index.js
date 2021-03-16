require('dotenv').config();

const Discord = require('discord.js');
const ytdl = require('discord-ytdl-core');
const db = require('./db');

const bot = new Discord.Client();

const { TOKEN } = process.env;

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

// Main logic
const prefix = '~';
const queue = new Map();

const helpScreen = {
  color: '#fed049',
  author: {
    name: 'BeachBot',
    url: 'https://github.com/jamesdools/beach-bot',
  },
  description: 'Everyone deserves entrance music.',
  fields: [
    {
      name: '`~entrance` \t [url] \t [startTime]',
      value: '**url** must be a valid YouTube link\n\
      **startTime** format `mm:ss`, eg. `2:48`',
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
  const startTime = args[2] || '0:00';
  const endTime = args[3] || null;

  if (!songUrl || !songUrl.includes('youtube')) return message.channel.send('No valid YouTube URL to use!');

  const songInfo = await ytdl.getInfo(songUrl);

  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
    startTime,
    endTime,
  };

  const user = message.author.id;
  const name = message.author.username;
  console.log(message.author);

  console.log(song);
  console.log(`User: ${name} - entrance music set`);
  console.log(`ID: ${user}`);

  await db.saveSong(user, song);

  return message.channel.send(`**${name}**'s entrance now music set: _${song.title}_`);
};

const play = (guild, song) => {
  const serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);

    return;
  }

  let nowPlayingString = `Now playing: ${song.title} from ${song.startTime}`;

  ffmpegArgs = ['-ss', song.startTime];

  if (song.endTime) {
    ffmpegArgs.push('-to', song.endTime);
    nowPlayingString = `${nowPlayingString} to ${song.endTime}`;
  }

  console.log(nowPlayingString);

  const ytdlContent = ytdl(song.url, {
    filter: 'audioonly',
    opusEncoded: true,
    encoderArgs: ffmpegArgs,
  });

  const dispatcher = serverQueue.connection
    .play(ytdlContent, { type: 'opus' })
    .on('finish', () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on('error', (error) => console.error('err'));

  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
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

bot.on('message', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  console.log('Guild ID: ' + message.guild.id);

  if (message.content.startsWith(prefix + 'beach')) {
    message.channel.send('shirt!'); 
  } else if (message.content.startsWith(prefix + 'help')) {
    message.channel.send({ embed: helpScreen });
  } else if (message.content === prefix + 'entrance on') {
    await updateSettings(message, true);
  } else if (message.content === prefix + 'entrance off') {
    await updateSettings(message, false);
  } else if (message.content.startsWith(prefix + 'entrance')) {
    // checkVoice(message);
    await entranceMusic(message);
  }
});

bot.on('voiceStateUpdate', async (oldState, newState) => {
  console.log('voiceStateUpdate');

  const oldChannel = oldState.channelID;
  const newChannel = newState.channelID;

  // TODO: Switching between channels
  if (!oldChannel && newChannel) {
    console.log(`New user joined channel: ${newState.id}`);

    const user = newState.id;
    const record = await db.get(user);

    if (!record) return; // Do nothing if no record

    const { song, enabled } = record;

    if (!enabled) return; // Exit if user has disabled entrance music
    
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

        console.log('Adding song to queue: ', song);
        play(newState.guild, song, connection);
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log('Adding song to queue: ', song);
      serverQueue.songs.push(song);
    }
  } else if (oldChannel && !newChannel) {
    // TODO: exit music?
    console.log(`User left the channel.`);
  }
});
