# CAMION - Discord Bot for Youtube Music 🎵

![CAMION Bot](https://preview.redd.it/mpvc156pdso51.jpg?auto=webp&s=e159b0cc3c6b3ec1ba71b6c9f4de133e50813e1e)

CAMION is a Discord bot designed to play music directly from **YouTube Music**. With its powerful features and modular architecture, it offers a smooth audio experience for Discord servers.

## Main Features 🚀

- Play music from YouTube Music.
- Queue management (add, remove, shuffle).
- Control commands and buttons: play, pause, resume, stop.
- Loop a track.
- Intuitive user interface with **Discord embeds** for an aesthetic display.

---

## Installation and Setup ⚙️

### Prerequisites
- **Node.js**: Version 16 or higher.
- A Discord bots with sufficient permissions.

### Installation Steps
1. Clone the repository
2. Install dependencies
3. Configure environment variables in the `.env` file at the root of the project:
   ```
   DISCORD_TOKEN=
   CLIENT_ID=
   GUILD_ID=
   ```

4. Run the bot:
   ```bash
   node index.js
   ```

---

## Available Commands 🎤

| Command        | Description                                           | Parameters |
|----------------|-------------------------------------------------------|------------|
| `/play`        | Play a song or playlist from YouTube Music.           | youtube url (playlist, video) + (optional) `when`: now, next, last |
| `/pause`       | Pause the playback.                                   |
| `/resume`      | Resume the playback.                                  |
| `/skip`        | Skip to the next song.                                |
| `/stop`        | Stop the playback and clear the queue.                |
| `/queue`       | Display the current queue.                            |
| `/loop`        | Toggle loop on a track or queue.                      |
| `/shuffle`     | Shuffle the songs in the queue.                       |
| `/disconnect`  | Disconnect the bot from the voice channel.            |

---

### Why "CAMION" 🚚
I don't really know myself, the name just looks nice 🤷 (Connectable Audio Music with Interactive Operator and Normalizer)

---

## License 📄

This project is licensed under the [MIT](./LICENSE) license.

---

## Author 👤

Developed with ❤️ by **Solare**. For any questions or suggestions, feel free to contact me!

