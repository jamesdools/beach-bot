# beach-bot
| Everyone deserves entrance music 🤘 👕 🏖

![Vince McMahon Entrance GIF](https://media.tenor.com/images/057161e766253130ca174e0b3740c0cd/tenor.gif)

> A Discord bot that will play a custom sound clip when you enter a voice channel!
## Developmemt

### Setup
```
npm install
npm run start:dev
```

This project needs `ffmpeg` on your system in order to run.

### Environment
a [`.env`](https://github.com/motdotla/dotenv) file is needed in the project, with the values:

```
TOKEN=
```

which will be accessible from the Discord Developer portal.

### Storage
The project uses [`lowdb`](https://github.com/typicode/lowdb) as a lightweight solution to persistent storage. This will save a `db.json` on the file system to keep user's entrance songs saved.