const { joinVoiceChannel, createAudioPlayer, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');
const { VoiceChannel, EmbedBuilder} = require("discord.js");
const QueueManager = require("./QueueManager");
const PlaylistExtractor = require("./PlaylistExtractor");
const Song = require("./Song");
const PlayerMessage = require("./PlayerMessage");

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

        this.loop = false;
        this.state = PlayerManager.STATE.IDLE;
        this.player = createAudioPlayer();

        this.message = new PlayerMessage();

        // Event listeners
        this.player.on(AudioPlayerStatus.Playing, () => {
            this.state = PlayerManager.STATE.PLAYING;
        });

        this.player.on(AudioPlayerStatus.Idle, () => {
            if(this.state !== PlayerManager.STATE.IDLE) {
                this.state = PlayerManager.STATE.IDLE;

                if(this.loop){
                    this.playSong(this.song);
                } else {
                    if(!this.queue.isEmpty()){
                        this.playSong(this.queue.nextSong());
                    }
                }
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
         await this.message.replyPlay(song, this.getProgress(), false, this.loop);

         try {
             const {createAudioResourceFromSong} = await import("./AudioManager.mjs");
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

    pauseSong(interaction) {
        if (this.state === PlayerManager.STATE.PLAYING) {
            let time = this.getProgress();

            this.player.pause();
            this.state = PlayerManager.STATE.PAUSED;

            this.message.interraction = interaction;
            this.message.replyPlay(this.song, time, true, this.loop);
        } else {
            console.log('Impossible de mettre en pause, aucune musique en lecture.');
        }
    }

    resumeSong(interaction) {
        if (this.state === PlayerManager.STATE.PAUSED) {
            this.player.unpause();
            this.state = PlayerManager.STATE.PLAYING;
            console.log('Musique reprise');

            this.message.interraction = interaction;
            this.message.replyPlay(this.song, this.getProgress(), false, this.loop);
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

    async preparePlaying(url) {
        if (!this.connection) {
            console.error('Vous devez être connecté à un canal vocal pour jouer de la musique.');
            return;
        }

        try {
            if (url.includes('playlist')) {
                let directPlay = false;
                const playlist = await PlaylistExtractor.getPlaylistURLs(url);

                if (this.state === PlayerManager.STATE.IDLE && this.queue.isEmpty()) {
                    let song = new Song(playlist.shift());
                    await song.update();

                    this.song = song;
                    await this.playSong(song);

                    directPlay = true;
                }

                const returnValue = directPlay ? 1 : 2;

                setTimeout(() => this.prepareQueue(playlist), 0);
                return returnValue;
            } else {
                let directPlay = false;
                let song = new Song(url);

                if (this.state === PlayerManager.STATE.PLAYING) {
                    this.queue.addToQueue(song);
                }

                if (this.state === PlayerManager.STATE.IDLE && this.queue.isEmpty()) {
                    await song.update();

                    this.song = song;
                    await this.playSong(song);

                    directPlay = true;
                }

                return directPlay ? 3 : 4;
            }
        } catch (error) {
            console.error('Erreur lors de la préparation de la lecture de la musique :', error);
        }
        return 0;
    }

    async prepareQueue(playlist){
        this.message.replyAddQueue(playlist.length);

        for (const link of playlist) {
            let song = new Song(link);
            song.update();

            console.log(`Ajout de la chanson à la queue : ${song.url}`);
            this.queue.addToQueue(song);


            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    getProgress(){
        if(this.player.state.status === AudioPlayerStatus.Playing){
            return this.player.state.resource.playbackDuration / 1000;
        } else {
            return 0;
        }
    }

}

module.exports = PlayerManager;
