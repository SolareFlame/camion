const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const PlayerManager = require("../utils/PlayerManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Affiche la file d\'attente de la musique'),

    async execute(interaction) {
        let playerManager = PlayerManager.getPlayer();
        let queue = playerManager.queue;

        if (!queue || queue.isEmpty()) {
            return interaction.reply('La file d\'attente est vide.');
        }

        let currentPage = 1;
        let isProcessing = false;

        const updateEmbed = (page) => {
            const queueString = queue.displayQueue(page);
            return new EmbedBuilder()
                .setTitle('File d\'attente')
                .setDescription(queueString)
                .setColor('#FF0033')
                .setFooter({ text: `Page ${page} sur ${queue.getPageCount()}` });
        };

        const createButtons = (page) => {
            const row = new ActionRowBuilder();
            const totalPages = queue.getPageCount();

            if (page > 1) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev_page')
                        .setLabel('⬅️')
                        .setStyle(ButtonStyle.Secondary)
                );
            }

            if (page < totalPages) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId('next_page')
                        .setLabel('➡️')
                        .setStyle(ButtonStyle.Secondary)
                );
            }
            return row;
        };

        const embedQueue = updateEmbed(currentPage);
        const buttons = createButtons(currentPage);

        const message = await interaction.reply({
            embeds: [embedQueue],
            components: buttons.components.length ? [buttons] : [],
            fetchReply: true
        });

        const collector = message.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (buttonInteraction) => {
            if (isProcessing) return buttonInteraction.reply({ content: 'Veuillez patienter...', ephemeral: true });

            isProcessing = true;
            try {
                if (buttonInteraction.customId === 'prev_page') {
                    currentPage--;
                } else if (buttonInteraction.customId === 'next_page') {
                    currentPage++;
                }

                const updatedEmbed = updateEmbed(currentPage);
                const updatedButtons = createButtons(currentPage);

                await buttonInteraction.update({
                    embeds: [updatedEmbed],
                    components: updatedButtons.components.length ? [updatedButtons] : [],
                });
            } catch (error) {
                console.error('Erreur lors de la mise à jour:', error);
            } finally {
                setTimeout(() => {
                    isProcessing = false;
                }, 1000);
            }
        });

        collector.on('end', () => {
            const disabledButtons = buttons.components.map(button =>
                button.setDisabled(true)
            );
            message.edit({ components: [new ActionRowBuilder().addComponents(disabledButtons)] }).catch(() => { });
        });
    },
};