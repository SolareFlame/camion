const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");

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

        // Connect
        PlayerManager.getPlayer().connect(channel);
        await PlayerManager.getPlayer().playSong(new Song(url));
    },
};