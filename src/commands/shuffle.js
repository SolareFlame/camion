const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('shuffle the current song'),

    execute(interaction) {
        let pm = PlayerManager.getPlayer();
        pm.queue.shuffleQueue();

        if(interaction) interaction.reply('La file d\'attente a été mélangée.');
    },
};
