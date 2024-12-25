const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");
const EmbedManager = require("../embed/EmbedManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('loop the current song'),

    execute(interaction){
        let pm = PlayerManager.getPlayer();

        if(pm.status === PlayerManager.STATE.IDLE) {
            if(!interaction.isButton()) interaction.reply('Aucune musique n\'est en cours de lecture.');
            interaction.deferUpdate();
            return;
        }

        pm.loop = !pm.loop;

        // Embed
        let em = new EmbedManager(interaction, null);
        em.update(pm);
    },
};