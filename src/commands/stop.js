const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('stop the current song'),

    execute(interaction){
        let pm = PlayerManager.getPlayer();

        if(pm.status === PlayerManager.STATE.IDLE) {
            if(!interaction.isButton()) interaction.reply('There is no song to stop');
            interaction.deferUpdate();
            return;
        }

        pm.stopSong();

        if(interaction) interaction.reply('La musique a été stoppée.');
    },
};
