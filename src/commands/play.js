const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');  // Assurez-vous d'importer EmbedBuilder
const PlayerManager = require("../utils/PlayerManager");
const Song = require("../utils/Song");
const PlaylistExtractor = require("../utils/PlaylistExtractor");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('play a song / playlist from a URL')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('youtube url')
                .setRequired(true)
        ),

    async execute(interaction) {
        let url = interaction.options.getString('url').split("&")[0];
        const channel = interaction.member.voice.channel;

        if (!url.includes('youtube') && !url.includes('youtu.be')) {
            return interaction.reply({ content: 'URL invalide !', ephemeral: true });
        }
        if (!channel) {
            return interaction.reply({ content: 'Vous devez être dans un salon vocal !', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: false });

        let playerManager = await PlayerManager.getPlayer();
        playerManager.connect(channel);

        try {
            if (url.includes('playlist')) {
                const videoLinks = await PlaylistExtractor.getPlaylistLinks(url);

                if (playerManager.state === PlayerManager.STATE.IDLE && playerManager.queue.getQueueSize() === 0) {
                    let song = new Song(videoLinks.shift());

                    console.log(`DIRECT PLAY : ${song.url}`);

                    playerManager.playSong(song);
                    await song.update();

                    setTimeout(() => {
                        interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle(`${song.artist} - ${song.title}`)
                                    .setColor('#00FF00')
                                    .setDescription(`Durée: ${song.duration}`)
                                    .setThumbnail(song.thumbnail)
                            ]
                        });
                    }, 3000);
                }

                for (const link of videoLinks) {
                    let song = new Song(link);
                    song.update();
                    console.log(`Ajout de la chanson à la queue : ${song.url}`);
                    playerManager.queue.addToQueue(song);

                    await new Promise(resolve => setTimeout(resolve, 200));
                }

            } else {
                let song = new Song(url);

                if (playerManager.state === PlayerManager.STATE.PLAYING) {
                    playerManager.queue.addToQueue(song);
                }

                if (playerManager.state === PlayerManager.STATE.IDLE && playerManager.queue.getQueueSize() === 0) {
                    playerManager.playSong(song);
                }

                await song.update();

                setTimeout(() => {
                    interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(`${song.artist} - ${song.title}`)
                                .setColor('#00FF00')
                                .setDescription(`Durée: ${song.duration}`)
                                .setThumbnail(song.thumbnail)
                        ]
                    });
                }, 3000);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de la playlist ou du traitement de la chanson :", error);
            return interaction.reply({ content: "Impossible de récupérer la playlist ou de jouer la chanson !", ephemeral: true });
        }
    },
};
