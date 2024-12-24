const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");

module.exports = {

    data: new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('bye'),

    async execute(interaction) {
        const playerManager = PlayerManager.getPlayer();
        await playerManager.stopSong();
        await playerManager.disconnect();

        if (interaction) {
            interaction.reply('La musique a été stoppée et je me suis déconnecté.');
            return;
        }
    },
};
