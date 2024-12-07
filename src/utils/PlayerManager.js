const { joinVoiceChannel, createAudioPlayer, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');
const { VoiceChannel } = require("discord.js");
const QueueManager = require("./QueueManager");

class PlayerManager {
    static STATE = Object.freeze({
        IDLE: '0',
        PLAYING: '1',
        PAUSED: '2',
        ERROR: '3',
    });

    constructor() {
        this.song = null;
        this.connection = null;
        this.queue = new QueueManager();

        this.state = PlayerManager.STATE.IDLE;
        this.player = createAudioPlayer();

        // Event listeners
        this.player.on(AudioPlayerStatus.Playing, () => {
            this.state = PlayerManager.STATE.PLAYING;
        });

        this.player.on(AudioPlayerStatus.Idle, () => {
            if(this.state !== PlayerManager.STATE.IDLE) {
                this.state = PlayerManager.STATE.IDLE;
                this.playSong(this.queue.nextSong());
            }
        });
    }

    static getPlayer() {
        if (!PlayerManager.instance || PlayerManager.instance === null) {
            PlayerManager.instance = new PlayerManager();
            console.log('Nouvelle instance de PlayerManager créée.');
        }
        return PlayerManager.instance;
    }


    // Primordial Interaction
    async playSong(song) {
        if (!this.connection) {
            console.error('Vous devez être connecté à un canal vocal pour jouer de la musique.');
            return;
        }
        if (this.state === PlayerManager.STATE.PLAYING) {
            console.log('Une chanson est déjà en cours de lecture.');
            return;
        }

        console.log('Lecture de la chanson: ' + song.url);

        try {
            const { createAudioResourceFromSong } = await import("./AudioManager.mjs");
            const resource = await createAudioResourceFromSong(song);

            if (!resource) {
                console.error('Impossible de créer la ressource audio.');
                return;
            }

            this.song = song;
            this.connection.subscribe(this.player);
            this.player.play(resource);

            console.log(`Lecture de la chanson: ${song.title}`);
        } catch (error) {
            console.error('Erreur lors de la lecture de la chanson :', error);
        }
    }

    pauseSong() {
        if (this.state === PlayerManager.STATE.PLAYING) {
            this.player.pause();
            this.state = PlayerManager.STATE.PAUSED;
            console.log('Musique en pause');
        } else {
            console.log('Impossible de mettre en pause, aucune musique en lecture.');
        }
    }

    resumeSong() {
        if (this.state === PlayerManager.STATE.PAUSED) {
            this.player.unpause();
            this.state = PlayerManager.STATE.PLAYING;
            console.log('Musique reprise');
        } else {
            console.log('Impossible de reprendre, aucune musique n\'est en pause.');
        }
    }

    stopSong() {
        if (this.state === PlayerManager.STATE.PLAYING) {
            this.player.stop();
            this.state = PlayerManager.STATE.IDLE;
            console.log('Musique sautée');
        } else {
            console.log('Impossible de sauter, aucune musique en lecture.');
        }
    }


    // Connect Gestion
    disconnect() {
        if (this.connection) {
            this.connection.destroy();
            this.connection = null;
        }
        this.player.stop();
        this.song = null;
        this.state = PlayerManager.STATE.IDLE;
        console.log('Déconnecté du canal vocal.');
    }

    connect(channel) {
        if (!channel || !(channel instanceof VoiceChannel)) {
            console.error('Veuillez fournir un canal vocal valide.');
            return;
        }

        this.connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        this.connection.on(VoiceConnectionStatus.Ready, () => {
            console.log('Connexion établie avec le canal vocal.');
        });

        this.connection.on(VoiceConnectionStatus.Disconnected, () => {
            console.log('Déconnecté du canal vocal.');
            this.connection = null;
        });
    }


    // Getters
    getSong() {
        return this.song;
    }

    setSong(song) {
        this.song = song;
    }



}

module.exports = PlayerManager;
