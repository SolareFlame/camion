const {
    joinVoiceChannel,
    createAudioPlayer,
    AudioPlayerStatus,
    VoiceConnectionStatus
} = require('@discordjs/voice');
const { VoiceChannel } = require("discord.js");
const play = require('play-dl');

class PlayerManager {

    static STATE = Object.freeze({
        VOID: '0',
        PLAYING: '1',
        PAUSED: '2',
    });

    constructor() {
        this.song = null;
        this.state = PlayerManager.STATE.VOID;
        this.connection = null;
        this.player = createAudioPlayer();
    }

    getSong() {
        return this.song;
    }

    setSong(song) {
        this.song = song;
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
        });
    }

    async playSong(song) {
        if (!this.connection) {
            console.error('Vous devez être connecté à un canal vocal pour jouer de la musique.');
            return;
        }

        if (this.state === PlayerManager.STATE.PLAYING) {
            console.log('Une chanson est déjà en cours de lecture.');
            return;
        }

        console.log(song.url);

        // Importation dynamique de createAudioResourceFromSong
        let createAudioResourceFromSong;
        try {
            // Remarque : assurez-vous que 'AudioManager.mjs' est au bon endroit
            const module = await import('./AudioManager.mjs');
            createAudioResourceFromSong = module.createAudioResourceFromSong;
        } catch (error) {
            console.error('Erreur lors de l\'importation de AudioManager:', error);
            return;
        }

        const resource = await createAudioResourceFromSong(song);
        if (!resource) {
            console.error('Impossible de créer la ressource audio.');
            return;
        }

        this.connection.subscribe(this.player);
        this.player.play(resource);

        this.state = PlayerManager.STATE.PLAYING;

        console.log(`Lecture de la chanson: ${song.title}`);
    }

    pause() {
        if (this.state === PlayerManager.STATE.PLAYING) {
            this.player.pause();
            this.state = PlayerManager.STATE.PAUSED;
            console.log('Musique en pause');
        }
    }

    resume() {
        if (this.state === PlayerManager.STATE.PAUSED) {
            this.player.unpause();
            this.state = PlayerManager.STATE.PLAYING;
            console.log('Musique reprise');
        }
    }

    stop() {
        if (this.state === PlayerManager.STATE.PLAYING || this.state === PlayerManager.STATE.PAUSED) {
            this.player.stop();
            this.state = PlayerManager.STATE.VOID;
            console.log('Musique arrêtée');
            if (this.connection) {
                this.connection.destroy();
                console.log('Déconnexion du canal vocal');
                this.connection = null;
            }
        }
    }
}

module.exports = PlayerManager;
