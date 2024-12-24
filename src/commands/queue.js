const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Affiche la file d\'attente de la musique'),

    execute(interaction) {
        let PlayerManager = PlayerManager.getPlayer();
        let queue = PlayerManager.queue;

        if (queue.getQueueSize() === 0) {
            interaction.reply('La file d\'attente est vide');
        }

        interaction.reply(queue.displayQueue(1));
    },
};
