const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('skip the current song'),

    async execute(interaction) {
        let playerManager = PlayerManager.getPlayer();

        playerManager.stopSong();
        playerManager.playSong(playerManager.queue.nextSong());

        if(interaction) return interaction.reply('La musique a été passée.');
    },
};
