const { joinVoiceChannel, createAudioPlayer, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');
const { VoiceChannel, EmbedBuilder} = require("discord.js");
const QueueManager = require("../utils/QueueManager");
const PlaylistExtractor = require("../utils/PlaylistExtractor");
const Song = require("../utils/Song");
const PlayerMessage = require("./PlayerEmbed");
const {SlashCommandBuilder} = require("@discordjs/builders");
const PlayerManager = require("../utils/PlayerManager");

module.exports = {
    async execute(interaction) {
        const customId = interaction.customId;

        let playerManager = await PlayerManager.getPlayer();

        let playerMessage = new PlayerMessage();
        playerMessage.setInterraction(interaction);
        playerMessage.setChannel(interaction.channel);

        playerManager.message = playerMessage;

        try {
            switch (customId) {
                case "pause":
                    await playerManager.pauseSong(interaction);
                    break;

                case "resume":
                    await playerManager.resumeSong(interaction);
                    break;

                default:
                    console.log("Unknown button clicked:", customId);
                    break;
            }
        } catch (error) {
            console.error("Error handling button interaction:", error);
        }
    }
};


