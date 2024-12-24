const { joinVoiceChannel, createAudioPlayer, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');
const { VoiceChannel, EmbedBuilder} = require("discord.js");
const QueueManager = require("./QueueManager");
const PlaylistExtractor = require("../extractor/PlaylistExtractor");
const Song = require("./Song");
const PlayerMessage = require("../embed/PlayerEmbed");

class PlayerManager {
    #player;
    #connection;
    #song;

    constructor() {
        this.player = createAudioPlayer();
        this.connection = null;

        this.song = null;
        this.queue = new QueueManager();

        this.loop = false;

        this.player.on(AudioPlayerStatus.Idle, () => {
            if (this.queue.isEmpty()) {
                console.log('[AUDIO PLAYER] : Queue is empty');
            } else {
                console.log('[AUDIO PLAYER] : Automatic skipping to next song');
                let song = this.queue.nextSong();
                this.playSong(song);
            }
        });
    }

    static getPlayer() {
        if (!PlayerManager.instance) {
            PlayerManager.instance = new PlayerManager();
        }
        return PlayerManager.instance;
    }

    async playSong(song) {
        if (!this.connection) {
            console.error('[AUDIO PLAYER] : No connection');
            return;
        }
        if (this.player.state.status === AudioPlayerStatus.Playing) {
            console.error('[AUDIO PLAYER] : Already playing');
            return;
        }

        try {
            const resource =  await createAudioStream(song.url);

            this.song = song;
            this.connection.subscribe(this.player);

            this.player.play(resource);

            console.log(`[AUDIO PLAYER] : Playing ${song.url}`);
        } catch (error) {
            console.error('[AUDIO PLAYER] : Error while playing song', error);
        }
    }

    pauseSong() {
        this.player.pause();
        console.log('[AUDIO PLAYER] : Paused');
    }

    resumeSong() {
        this.player.unpause();
        console.log('[AUDIO PLAYER] : Resumed');
    }

    stopSong() {
        this.player.stop();
        console.log('[AUDIO PLAYER] : Stopped');
    }

    disconnect() {
        if (this.connection) {
            this.player.stop();
            this.connection.destroy();
        }
        console.log('[AUDIO PLAYER] : Disconnected');
    }

    connect(channel) {
        if (!channel) {
            console.error('[AUDIO PLAYER] : Invalid channel');
            return;
        }

        this.connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        this.connection.on(VoiceConnectionStatus.Ready, () => {
            console.log('[AUDIO PLAYER] : Connected to voice channel');
        });

        this.connection.on(VoiceConnectionStatus.Disconnected, () => {
            console.log('[AUDIO PLAYER] : Disconnected from voice channel');
            this.connection = null;
        });
    }


    status() {
        if (!this.connection) return 'not_connected';
        if (this.player.state.status === AudioPlayerStatus.Idle) return 'idle';
        if (this.player.state.status === AudioPlayerStatus.Paused) return 'paused';
        if (this.player.state.status === AudioPlayerStatus.Playing) return 'playing';
        return 'unknown';
    }
}

module.exports = PlayerManager;
