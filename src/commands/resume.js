const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");
const EmbedManager = require("../embed/EmbedManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('resume the current song'),

    execute(interaction){
        let pm = PlayerManager.getPlayer();

        if(pm.status === PlayerManager.STATE.PLAYING && !interaction.isButton()) {
            interaction.reply('The song is already playing');
        }

        pm.resumeSong();

        // Embed
        let em = new EmbedManager(interaction, null);
        em.update(pm);
    },
};