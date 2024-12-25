const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");
const EmbedManager = require("../embed/EmbedManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('pause the current song'),

    execute(interaction) {
        let pm = PlayerManager.getPlayer();

        if(pm.status === PlayerManager.STATE.PAUSED && !interaction.isButton()) {
            interaction.reply('The song is already paused');
        }

        if(pm.status === PlayerManager.STATE.IDLE && !interaction.isButton()) {
            interaction.reply('There is no song to pause');
        }

        pm.pauseSong();

        // Embed
        let em = new EmbedManager(interaction, null);
        em.update(pm);
    },
};
