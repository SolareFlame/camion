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
        let playerManager = PlayerManager.getPlayer();
        let queue = playerManager.queue;

        const move = interaction.options.getInteger('move');
        const to = interaction.options.getInteger('to');

        if (move > queue.length || to > queue.length) {
            await interaction.reply("Invalid move or to value");
            return;
        }

        queue.moveInQueue(move, to);
        await interaction.reply(`Moved song from position ${move} to position ${to}`);
    }
};