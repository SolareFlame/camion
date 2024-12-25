const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");

module.exports = {

    data: new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('bye'),

    async execute(interaction) {
        const pm = PlayerManager.getPlayer();
        await pm.stopSong();
        await pm.disconnect();

        if (interaction) {
            interaction.reply('La musique a été stoppée et je me suis déconnecté.');
            return;
        }
    },
};
