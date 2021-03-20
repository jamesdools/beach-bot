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

## Deployment
This project has been a trial of using Amazon Linux EC2 (typically using CentOS 7 & a Jenkins pipeline).

How it was deployed:

1. **Connect to instance** `ssh -i <cert> <ec2instance>`
2. **Install Node** `curl -fsSL https://rpm.nodesource.com/setup_14.x | sudo bash -` \ `sudo yum install -y nodejs`
3. **Install Git** `sudo yum install git -y`
4. **Clone repo** `git clone https://github.com/jamesdools/beachbot.git`

