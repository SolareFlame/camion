const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('resume the current song'),

    execute(interaction){
        let PlayerManager = PlayerManager.getPlayer();

        if(PlayerManager.status() === 'playing') {
            interaction.reply('The song is already playing');
        }

        PlayerManager.resumeSong();
    },
};