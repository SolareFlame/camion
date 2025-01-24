const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");
const Song = require("../utils/Song");
const EmbedManager = require("../embed/EmbedManager");
const PlaylistExtractor = require("../extractor/PlaylistExtractor");
const { getUrlFromJson } = require("../extractor/LibExtractor");
const SongDataExtractor = require("../extractor/SongDataExtractor");

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

        // CHECKING YOUTUBE LINK
        if (!url.includes('youtube') && !url.includes('youtu.be')) {
            console.log('[COMMAND PLAY] : Invalid URL');
            interaction.reply({content: 'URL invalide !', ephemeral: true});
            return;
        }
        // CHECKING VOICE CHANNEL CONNECTION
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
            let playlist_urls = await PlaylistExtractor.getPlaylistURLs(url);
            let playlist_data = await SongDataExtractor.extractDetails(url);

            if (playlist_urls.length !== playlist_data.length) {
                throw new Error("Playlist data and playlist urls are not the same length")
            }

            for (let i = 0; i < playlist_urls.length; i++) {
                const song = new Song(playlist_urls[i]);
                await song.updateSongExt(playlist_data[i]);

                pm.queue.addToQueue(song);
            }

            song = pm.queue.nextSong();
        } else {
            song = new Song(url);
            await song.updateSong();
        }


        // When (playing)
        switch (interaction.options.getString('when')) {

            case 'now':
                pm.stopSong();
                await pm.playSong(song);

                pm.song = song;
                await EmbedManager.getEmbed().update(pm, interaction);

                break;

            case 'next':
                pm.queue.addToQueueNext(song)

                interaction.editReply({content: `Ajouté à la file d'attente : ${song.title} - ${song.artist}`});

                break;


            default:
                if(pm.status !== PlayerManager.STATE.PLAYING) {
                    pm.playSong(song)
                    pm.song = song;

                    await EmbedManager.getEmbed().update(pm, interaction);
                } else {
                    pm.queue.addToQueue(song);
                    interaction.editReply({content: `Ajouté à la file d'attente : ${song.title} - ${song.artist}`});
                }
        }
    },
};