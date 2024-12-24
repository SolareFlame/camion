const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('skip the current song'),

    async execute(interaction){
        let PlayerManager = PlayerManager.getPlayer();

        PlayerManager.stopSong();
        await PlayerManager.playSong(PlayerManager.queue.nextSong());

        if(interaction) interaction.reply('La musique a été passée.');
    },
};
