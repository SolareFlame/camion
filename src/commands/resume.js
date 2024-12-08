const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('resume the current song'),

    async execute(interaction) {
        let playerManager = PlayerManager.getPlayer();

        if(playerManager.state === PlayerManager.STATE.PAUSED){
            await interaction.deferReply({ephemeral: false});
            playerManager.resumeSong(interaction);
        }
    },
};