const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");

module.exports = {

    data: new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('bye'),

    async execute(interaction) {
        const PlayerManager = PlayerManager.getPlayer();
        await PlayerManager.stopSong();
        await PlayerManager.disconnect();

        if (interaction) {
            interaction.reply('La musique a été stoppée et je me suis déconnecté.');
            return;
        }
    },
};
