const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");
const Song = require("../utils/Song");
const EmbedManager = require("../embed/EmbedManager");
const PlaylistExtractor = require("../extractor/PlaylistExtractor");

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

        if(url === "test") {
            console.log('[COMMAND PLAY] : Test URL');
            url = "https://music.youtube.com/watch?v=dvuhQEDXvN8&si=xzTLU9qnmKWiUuEq";
        }

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

            song = pm.queue.nextSong();
        } else {
            song = new Song(url);
        }

        // When
        switch (interaction.options.getString('when')) {
            case 'now':
                console.log('[COMMAND PLAY] : Play now');

                pm.queue.addToQueueNext(song);
                pm.stopSong();
                await pm.playSong(song);
                break;
            case 'next':
                console.log('[COMMAND PLAY] : Play next');

                pm.queue.addToQueueNext(song);
                break;
            default:
                if(pm.status !== PlayerManager.STATE.PLAYING) {
                    console.log('[COMMAND PLAY] : Play last (now)');

                    pm.playSong(song);
                } else {
                    console.log('[COMMAND PLAY] : Play last (queue)');

                    pm.queue.addToQueue(song);
                }
        }

        // Embed
        let em = new EmbedManager(interaction, channel);
        song.update().then(() => {
            pm.song = song;

            em.update(pm);
        });
    },
};