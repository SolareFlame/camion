const { joinVoiceChannel, createAudioPlayer, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');
const QueueManager = require("./QueueManager");
const {createAudioStream} = require("./AudioManager");
const {updateEmbed} = require("../embed/EmbedManager");
const EmbedManager = require("../embed/EmbedManager");

class PlayerManager {
    static STATE = Object.freeze({
        IDLE: 0,
        PLAYING: 1,
        PAUSED: 2,
    });

    #player;
    #connection;
    #song;

    constructor() {
        this.player = createAudioPlayer();
        this.connection = null;

        this.song = null;
        this.queue = new QueueManager();

        this.loop = false;
        this.status = PlayerManager.STATE.IDLE;

        this.player.on(AudioPlayerStatus.Idle, () => {
            EmbedManager.getEmbed().updateEnd(this, null);
            console.log('[AUDIO PLAYER] : Song ended --> AUTO UPDATING');

            if(this.loop) {
                console.log('[AUDIO PLAYER] : Looping current song');
                this.playSong(this.song);

                EmbedManager.getEmbed().update(this, null);
                return;
            }

            if (this.queue.isEmpty()) {
                console.log('[AUDIO PLAYER] : Queue is empty');
            } else {
                console.log('[AUDIO PLAYER] : Automatic skipping to next song');
                let song = this.queue.nextSong();
                this.playSong(song);

                EmbedManager.getEmbed().update(this, null);
            }
        });
    }

    static getPlayer() {
        if (!PlayerManager.instance || PlayerManager.instance === null) {
            PlayerManager.instance = new PlayerManager();
            console.log('[AUDIO PLAYER] : New instance created');
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
        if(!song) {
            console.error('[AUDIO PLAYER] : No song');
        }

        try {
            this.song = song;
            this.status = PlayerManager.STATE.PLAYING;

            const resource =  await createAudioStream(song.url);
            this.connection.subscribe(this.player);

            this.player.play(resource);

            console.log(`[AUDIO PLAYER] : Playing ${song.url}`);
        } catch (error) {
            console.error('[AUDIO PLAYER] : Error while playing song', error);
        }
    }

    pauseSong() {
        this.status = PlayerManager.STATE.PAUSED;
        this.player.pause();
        console.log('[AUDIO PLAYER] : Paused');
    }

    resumeSong() {
        this.status = PlayerManager.STATE.PLAYING;
        this.player.unpause();
        console.log('[AUDIO PLAYER] : Resumed');
    }

    stopSong() {
        this.status = PlayerManager.STATE.IDLE;
        this.player.stop(true);
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

    getDuration() {
        if (this.player.state.resource === undefined) return 0;
        return this.player.state.resource.playbackDuration;
    }
}

module.exports = PlayerManager;
