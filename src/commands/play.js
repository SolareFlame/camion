const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");
const Song = require("../utils/Song");
const EmbedManager = require("../embed/EmbedManager");
const PlaylistExtractor = require("../extractor/PlaylistExtractor");
const { getUrlFromJson } = require("../extractor/LibExtractor");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song / playlist from a URL')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('YouTube URL')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('when')
                .setDescription('When to play the song')
                .setRequired(false)
                .addChoices(
                    { name: 'now', value: 'now' },
                    { name: 'next', value: 'next' },
                    { name: 'last', value: 'last' },
                )
        ),


    async execute(interaction) {
        let url = interaction.options.getString('url').split("&")[0];
        const channel = interaction.member.voice.channel;

        url = getUrlFromJson(url);

        if (!url.includes('youtube') && !url.includes('youtu.be')) {
            console.log('[COMMAND PLAY] : Invalid URL');
            interaction.reply({content: 'URL invalide !', ephemeral: true});
            return;
        }
        if (!channel) {
            console.log('[COMMAND PLAY] : User not in a voice channel');
            interaction.reply({content: 'Vous devez être dans un salon vocal !', ephemeral: true});
            return;
        }

        await interaction.deferReply({ephemeral: false});

        let pm = await PlayerManager.getPlayer();

        pm.connect(channel);
        let song;

        // Playlist
        if (url.includes('list=')) {
            console.log('[COMMAND PLAY] : Playlist detected');

            let playlist = await PlaylistExtractor.getPlaylistURLs(url)
            playlist.forEach((url) => {
                let s = new Song(url);
                pm.queue.addToQueue(s);
            });

            pm.queue.updateQueue();

            if(pm.status !== PlayerManager.STATE.PLAYING) {
                song = pm.queue.nextSong();

                await pm.playSong(song);

                song.updateSong().then(() => {
                    pm.song = song;
                    EmbedManager.getEmbed().update(pm, interaction);
                });
                return;
            }
        }

        song = new Song(url);

        // When (playing)
        switch (interaction.options.getString('when')) {
            case 'now':
                console.log('[COMMAND PLAY] : Play now');

                pm.queue.addToQueueNext(song);
                pm.stopSong();
                await pm.playSong(song);

                song.updateSong().then(() => {
                    pm.song = song;
                    EmbedManager.getEmbed().update(pm, interaction);
                });

                break;
            case 'next':
                console.log('[COMMAND PLAY] : Play next');

                pm.queue.addToQueueNext(song)

                song.updateSong().then(() => {
                    interaction.editReply({content: `Ajouté à la file d'attente : ${song.title} - ${song.artist}`});
                });

                break;
            default:
                if(pm.status !== PlayerManager.STATE.PLAYING) {
                    console.log('[COMMAND PLAY] : Play last (now)');
                    pm.playSong(song)

                    song.updateSong().then(() => {
                        pm.song = song;
                        EmbedManager.getEmbed().update(pm, interaction);
                    });

                } else {
                    console.log('[COMMAND PLAY] : Play last (queue)');

                    pm.queue.addToQueue(song);

                    song.updateSong().then(() => {
                        interaction.editReply({content: `Ajouté à la file d'attente : ${song.title} - ${song.artist}`});
                    });
                }
        }
    },
};