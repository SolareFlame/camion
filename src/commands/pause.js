const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");
const EmbedManager = require("../embed/EmbedManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('pause the current song'),

    execute(interaction) {
        let pm = PlayerManager.getPlayer();

        if(pm.status === PlayerManager.STATE.PAUSED || pm.status === PlayerManager.STATE.IDLE) {
            if(!interaction.isButton()) interaction.reply('There is no song to pause');
            interaction.deferUpdate();
            return;
        }

        pm.pauseSong();

        EmbedManager.getEmbed().update(pm, interaction);
    },
};
