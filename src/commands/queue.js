const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel } = require('@discordjs/voice');
const PlayerManager = require("../utils/PlayerManager");
const Song = require("../utils/Song");
const QueueManager = require("../utils/QueueManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Affiche la file d\'attente de la musique'),

    async execute(interaction) {
        let playerManager = PlayerManager.getPlayer();
        let queue = playerManager.queue;

        if (!queue || queue.getQueueSize() === 0) {
            return interaction.reply('La file d\'attente est vide.');
        }

        const queueString = queue.displayQueue();
        return interaction.reply(queueString);
    },
};
