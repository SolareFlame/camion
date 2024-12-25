const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Affiche la file d\'attente de la musique'),

    execute(interaction) {
        let pm = PlayerManager.getPlayer();

        if (pm.queue.isEmpty()) {
            interaction.reply('La file d\'attente est vide');
        }

        interaction.reply(pm.queue.displayQueue(1));
    },
};
