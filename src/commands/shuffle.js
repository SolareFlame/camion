const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('shuffle the current song'),

    execute(interaction) {
        let pm = PlayerManager.getPlayer();

        if(pm.queue.isEmpty()) {
            if(!interaction.isButton()) interaction.reply('La file d\'attente est vide.');
            interaction.deferUpdate();
            return;
        }

        pm.queue.shuffleQueue();

        if(interaction) interaction.reply('La file d\'attente a été mélangée.');
    },
};
