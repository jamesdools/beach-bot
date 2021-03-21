const ytdl = require('discord-ytdl-core');
const db = require('./db');

const prefix = '~';
const queue = new Map();

const parseArgs = (content) => {
  const args = content.slice(prefix.length).trim().split(' ');
  const command = args[0].toLowerCase();
  console.log(`args: ${args}`);
  console.log(`command: ${command}`);

  return { args, command };
};

const parseUrl = (url, message) => {
  if (!url.includes('youtube')) return message.channel.send('No valid YouTube URL to use!');

  return url.replace(/[\<\>]/g, ''); // remove < > characters (to stop chat embeds)
}

const registerMusic = async (message) => {
  const { args } = parseArgs(message.content);
  const songUrl = parseUrl(args[1]);
  const startTime = args[2] || '0:00';
  const endTime = args[3] || null;
  
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

const addToPlayQueue = async (voiceState, song) => {
 const serverQueue = queue.get(voiceState.guild.id);

    if (!serverQueue) {
      const queueContruct = {
        textChannel: '',
        voiceChannel: voiceState.channel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
      };

      queue.set(voiceState.guild.id, queueContruct);
      queueContruct.songs.push(song);

      try {
        const connection = await voiceState.channel.join();

        queueContruct.connection = connection;

        console.log('Adding song to queue: ', song);
        play(voiceState.guild, song, connection);
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log('Adding song to queue: ', song);
      serverQueue.songs.push(song);
    }
}

const play = (guild, song) => {
  const serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);

    return;
  }

  let nowPlayingString = `Now playing: ${song.title} from ${song.startTime}`;

  ffmpegArgs = ['-ss', song.startTime];

  if (song.endTime) { // TODO: Add stable support for endTime
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
      console.log('Song finished');
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on('error', (error) => {
      console.error('Error playing song:');
      console.error(error);

      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
    
      return;
    });

  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
};

const handleEntrance = async (voiceState) => {
    const user = voiceState.id;
    const record = await db.get(user);

    if (!record) return; // Do nothing if no song on record

    const { song, enabled } = record;

    if (!enabled) return; // Exit if user has disabled entrance music

    await addToPlayQueue(voiceState, song);   
};

module.exports = {
  handleEntrance,
  registerMusic,
  play,
}