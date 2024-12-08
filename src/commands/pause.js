const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('pause the current song'),

    async execute(interaction) {
        let playerManager = PlayerManager.getPlayer();

        if(playerManager.state === PlayerManager.STATE.PLAYING){
            await interaction.deferReply({ephemeral: false});
            playerManager.pauseSong(interaction);
        }
    },
};
