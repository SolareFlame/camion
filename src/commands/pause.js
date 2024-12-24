const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('pause the current song'),

    execute(interaction ) {
        let playerManager = PlayerManager.getPlayer();

        if(playerManager.status() === 'paused') {
            interaction.reply('The song is already paused');
        }

        playerManager.pauseSong();
    },
};
