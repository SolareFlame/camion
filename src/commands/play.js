const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel } = require('@discordjs/voice');
const PlayerManager = require("../utils/PlayerManager");
const Song = require("../utils/Song");
const QueueManager = require("../utils/QueueManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('play a song / playlist from a URL')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('youtube url')
                .setRequired(true)
        ),

    async execute(interaction) {
        let url = interaction.options.getString('url').split("&")[0];
        const guildId = interaction.guild.id;
        const channel = interaction.member.voice.channel;

        if (!url.includes('youtube') && !url.includes('youtu.be')) return interaction.reply('URL invalide !');
        if (!channel) return interaction.reply('Vous devez être dans un salon vocal !');

        let player = global.player;

        if (!player) {
            player = global.player = new PlayerManager();
            console.log('Player created');
            player.connect(channel);
        }

        let song = new Song("e", "ee", 1, url);

        if(player.state === PlayerManager.STATE.PLAYING){
            player.queue.addToQueue(song);
        }

        if (player.state === PlayerManager.STATE.IDLE && player.queue.getQueueSize() === 0) {
            player.playSong(song);
            player.state = PlayerManager.STATE.PLAYING;
        }

        if(interaction) return interaction.reply(player.queue.displayQueue());
    },
};
