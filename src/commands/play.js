const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');  // Assurez-vous d'importer EmbedBuilder
const PlayerManager = require("../utils/PlayerManager");
const Song = require("../utils/Song");
const PlaylistExtractor = require("../utils/PlaylistExtractor");
const PlayerMessage = require("../utils/PlayerMessage");

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
            return interaction.reply({content: 'URL invalide !', ephemeral: true});
        }
        if (!channel) {
            return interaction.reply({content: 'Vous devez être dans un salon vocal !', ephemeral: true});
        }

        await interaction.deferReply({ephemeral: false});

        let playerManager = await PlayerManager.getPlayer();

        let playerMessage = new PlayerMessage();
        playerMessage.setInterraction(interaction);
        playerMessage.setChannel(interaction.channel);

        playerManager.message = playerMessage;
        playerManager.connect(channel);

        await playerManager.preparePlaying(url);
    },
};
