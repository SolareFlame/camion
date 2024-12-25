const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('resume the current song')
        .addIntegerOption(option =>
            option.setName('move')
                .setDescription('move')
                .setRequired(true))

        .addIntegerOption(option =>
            option.setName('to')
                .setDescription('to')
                .setRequired(true)),


    async execute(interaction) {
        let pm = PlayerManager.getPlayer();
        let queue = pm.queue;

        const move = interaction.options.getInteger('move');
        const to = interaction.options.getInteger('to');

        if (move < 1 || move > queue.getQueueSize()) {
            interaction.reply(`Invalid move position. Please enter a number between 1 and ${queue.getQueueSize()}`);
            return;
        }

        queue.moveInQueue(move, to);
        await interaction.reply(`Moved song from position ${move} to position ${to}`);
    }
};