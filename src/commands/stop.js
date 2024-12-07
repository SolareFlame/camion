const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('stop the current song'),

    async execute(interaction) {
        let playerManager = PlayerManager.getPlayer();

        playerManager.stopSong();

        if(interaction) return interaction.reply('La musique a été stoppée.');
    },
};
