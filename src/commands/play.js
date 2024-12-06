const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel } = require('@discordjs/voice');
const PlayerManager = require("../utils/PlayerManager");
const Song = require("../utils/Song");

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
        const url = interaction.options.getString('url');
        const guildId = interaction.guild.id;
        const channel = interaction.member.voice.channel;

        if (!url.includes('youtube') && !url.includes('youtu.be')) return interaction.reply('URL invalide !');
        if (!channel) return interaction.reply('Vous devez être dans un salon vocal !');

        let player = null;
        if (!player) {
            player = new PlayerManager();
            console.log('Player created');
            player.connect(channel);
        }

        song = new Song("e", "ee", 1, "https://www.youtube.com/watch?v=_t0Q5zJgOCI");
        player.playSong(song);

        await interaction.reply(`Ajouté à la queue : ${url}`);
    },
};
