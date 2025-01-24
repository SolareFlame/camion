const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

class EmbedManager {
    static STATE = Object.freeze({
        PLAYING_START: '<:playing_start:1315319232493523035>',
        PLAYED_START: '<:played_start:1315317278669017109>',
        PLAYED: '<:played:1315317305047253083>',
        PLAYING: '<:playing:1315317325947207771>',
        NOT_PLAYED: '<:notplayed:1315324031095803925>',
        NOT_PLAYED_END: '<:notplayed_end:1315324012385144872>',
        PLAYED_END: '<:played_end:1315317390606598154>',
        BTN_RESUME: '<:resume:1315605425361780737>',
        BTN_PAUSE: '<:pause:1315605441803321386>',
        BTN_NEXT: '<:next:1315605489693753384>',
        BTN_STOP: '<:stop:1315605510061428817>',
        BTN_DISCONNECT: '<:disconnect:1315605524615659580>',
        BTN_LOOP: '<:loop:1315605545075474527>',
        BTN_UNLOOP: '<:unloop:1315605559017472041>',
        BTN_SHUFFLE: '<:shuffle:1315605578927575102>',
        BTN_QUEUE: '<:queue:1315605596917207080>',
    });

    #channel = null;
    #message = null;

    static getEmbed() {
        if (!EmbedManager.instance || EmbedManager.instance === null) {
            EmbedManager.instance = new EmbedManager();
            console.log('[EMBED] : New instance created');
        }
        return EmbedManager.instance;
    }

    async update(pm, interaction) {
        console.log("[EMBED] Updating embed...");
        console.log("[EMBED] Current song:", pm.song?.title || "Unknown");

        if (interaction !== null) {
            this.#channel = interaction.channel;
        }

        let song = pm.song;
        let progress = pm.getDuration() / 1000;
        let desc = `(${this.getFormattedDuration(progress)}) ${this.getSeekBar(progress, song.duration, 9)} (${this.getFormattedDuration(song.duration)})`;

        if(song.thumbnail === null) {
            await song.updateThumbnail();
        }

        let embed = new EmbedBuilder()
            .setAuthor({
                name: "Truck-Kun ~",
                url: "https://github.com/solareflame/camion",
                iconURL: "https://imgur.com/V3YBKuw.gif"
            })
            .setTitle(`${song.title} - ${song.artist}`)
            .setDescription(desc)
            .setColor('#FF0033')
            .setThumbnail(song.thumbnail)
            .setURL(song.url)
            .setTimestamp();

        let buttons = new ActionRowBuilder();

        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId(pm.status === 1 ? "pause" : "resume")
                .setStyle(ButtonStyle.Danger)
                .setEmoji(pm.status === 1 ? EmbedManager.STATE.BTN_PAUSE : EmbedManager.STATE.BTN_RESUME)
        );

        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId("skip")
                .setStyle(ButtonStyle.Danger)
                .setEmoji(EmbedManager.STATE.BTN_NEXT)
        );

        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId("stop")
                .setStyle(ButtonStyle.Danger)
                .setEmoji(EmbedManager.STATE.BTN_STOP)
        );

        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId("shuffle")
                .setStyle(ButtonStyle.Danger)
                .setEmoji(EmbedManager.STATE.BTN_SHUFFLE)
        );

        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId("loop")
                .setStyle(ButtonStyle.Danger)
                .setEmoji(pm.loop ? EmbedManager.STATE.BTN_UNLOOP : EmbedManager.STATE.BTN_LOOP)
        );


        if (interaction) {
            if (interaction.isButton()) {
                console.log("[EMBED] Button interaction detected");

                let message = interaction.message;
                message.edit({ embeds: [embed], components: [buttons] })
                    .then(() => console.log("[EMBED] Message updated via button interaction"))
                    .catch(err => console.error("[EMBED] Failed to update message via button:", err));

                interaction.deferUpdate();
            } else {
                console.log("[EMBED] Command interaction detected");

                if (interaction.deferred) {
                    interaction.editReply({ embeds: [embed], components: [buttons] })
                        .then(msg => {
                            this.#message = msg;
                            console.log("[EMBED] Message updated via editReply");
                        })
                        .catch(err => console.error("[EMBED] Failed to edit reply:", err));
                } else {
                    interaction.reply({ embeds: [embed], components: [buttons] })
                        .then(msg => {
                            this.#message = msg;
                            console.log("[EMBED] Message sent via reply");
                        })
                        .catch(err => console.error("[EMBED] Failed to send reply:", err));
                }
            }
        } else {
            if (this.#channel) {
                this.#channel.send({ embeds: [embed], components: [buttons] })
                    .then(msg => {
                        this.#message = msg;
                        console.log("[EMBED] Message sent to channel");
                    })
                    .catch(err => console.error("[EMBED] Failed to send message to channel:", err));
            } else {
                console.error("[EMBED] No channel available to send the embed");
            }
        }
    }


    updateEnd(pm, interaction) {
        console.log("[EMBED] Updating embed...");
        console.log("[EMBED] Current song:", pm.song?.title || "Unknown");

        if (interaction !== null) {
            this.#channel = interaction.channel;
        }

        let song = pm.song;
        let desc = `(${this.getFormattedDuration(song.duration)}) ${this.getSeekBar(song.duration, song.duration, 9)} (${this.getFormattedDuration(song.duration)})`;

        let embed = new EmbedBuilder()
            .setAuthor({
                name: "Truck-Kun ~",
                url: "https://github.com/solareflame/camion",
                iconURL: "https://imgur.com/V3YBKuw.gif"
            })
            .setTitle(`${song.title} - ${song.artist}`)
            .setDescription(desc)
            .setColor('#FF0033')
            .setThumbnail(song.thumbnail)
            .setURL(song.url)
            .setTimestamp();

        if (this.#message) {

            console.log("DEBUG: ", this.#message.embeds[0].description);

            this.#message.edit({ embeds: [embed], components: []})
                .then(() => console.log("[EMBED] Message updated via newEmbed"))
                .catch(err => console.error("[EMBED] Failed to update message via newEmbed:", err));

            return;
        } else {
            console.error("[EMBED] No message found to update with newEmbed");
        }

        if (this.#channel) {
            this.#channel.send({ embeds: [embed], components: []})
                .then(msg => {
                    this.#message = msg;
                    console.log("[EMBED] Message sent to channel");
                })
                .catch(err => console.error("[EMBED] Failed to send message to channel:", err));
        } else {
            console.error("[EMBED] No channel available to send the embed");
        }
    }

    getSeekBar(progress, duration, bar_size) {
        let bar = "";
        let thumb_pos = Math.floor(progress / duration * bar_size);

        process.stdout.write("[EMBED] Seek bar: ");

        if (thumb_pos === 0) {
            bar += EmbedManager.STATE.PLAYING_START;
            process.stdout.write(">");
        } else {
            bar += EmbedManager.STATE.PLAYED_START;
            process.stdout.write("=");
        }

        for (let i = 0; i < bar_size; i++) {
            if (i < thumb_pos) {
                bar += EmbedManager.STATE.PLAYED;
                process.stdout.write("=");
            } else if (i === thumb_pos && i !== 0) {
                bar += EmbedManager.STATE.PLAYING;
                process.stdout.write(">");
            } else {
                bar += EmbedManager.STATE.NOT_PLAYED;
                process.stdout.write("-");
            }
        }

        if (thumb_pos < bar_size) {
            bar += EmbedManager.STATE.NOT_PLAYED_END;
            process.stdout.write("-");
        } else {
            bar += EmbedManager.STATE.PLAYED_END;
            process.stdout.write(">");
        }

        console.log("");
        return bar;
    }

    getFormattedDuration(duration) {
        let minutes = Math.floor(duration / 60);
        let seconds = Math.floor(duration % 60);
        return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
    }
}

module.exports = EmbedManager;
