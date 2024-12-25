const { SlashCommandBuilder } = require('@discordjs/builders');
const PlayerManager = require("../utils/PlayerManager");
const EmbedManager = require("../embed/EmbedManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('skip the current song'),

    async execute(interaction){
        let pm = PlayerManager.getPlayer();

        pm.stopSong();
        await pm.playSong(PlayerManager.queue.nextSong());

        // Embed
        let em = new EmbedManager(interaction, null);
        em.update(pm);
    },
};
