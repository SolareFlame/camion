const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

class PlayerEmbed {
    static STATE = Object.freeze({
        PLAYING_START : '<:playing_start:1315319232493523035>',
        PLAYED_START : '<:played_start:1315317278669017109>',
        PLAYED : '<:played:1315317305047253083>',
        PLAYING : '<:playing:1315317325947207771>',
        NOT_PLAYED : '<:notplayed:1315324031095803925>',
        NOT_PLAYED_END : '<:notplayed_end:1315324012385144872>',
        PLAYED_END : '<:played_end:1315317390606598154>',
        BTN_RESUME : '<:resume:1315605425361780737>',
        BTN_PAUSE : '<:pause:1315605441803321386>',
        BTN_NEXT : '<:next:1315605489693753384>',
        BTN_STOP : '<:stop:1315605510061428817>',
        BTN_DISCONNECT : '<:disconnect:1315605524615659580>',
        BTN_LOOP : '<:loop:1315605545075474527>',
        BTN_UNLOOP : '<:unloop:1315605559017472041>',
        BTN_SHUFFLE : '<:shuffle:1315605578927575102>',
        BTN_QUEUE : '<:queue:1315605596917207080>',
    });

    constructor() {
        this.interraction = null;
        this.channel = null;
    }

    setInterraction(interraction) {
        this.interraction = interraction;
    }

    setChannel(channel) {
        this.channel = channel;
    }

    async replyPlay(song, duration, pause, loop) {
        console.log("REPLY PLAY");

        if (!song || !song.duration || !song.title || !song.artist || !song.thumbnail) {
            console.error("Invalid song object");
            return;
        }

        let song_duration_in_sec = convertDurationToSeconds(song.duration);
        if (isNaN(song_duration_in_sec)) {
            console.error("Invalid song duration");
            return;
        }

        let desc = "(" + (song_duration_in_sec - duration) + ")  ";
        let pos_cursor = Math.round(duration / song_duration_in_sec * 9);

        console.log("POS CURSOR : " + pos_cursor);
        console.log("DURATION : " + duration);
        console.log("SONG DURATION : " + song_duration_in_sec);

        // start
        if (pos_cursor < 1) desc += PlayerEmbed.STATE.PLAYING_START;
        else desc += PlayerEmbed.STATE.PLAYED_START;

        // played
        for (let i = 0; i < pos_cursor - 1; i++) {
            desc += PlayerEmbed.STATE.PLAYED;
        }

        // playing
        if (pos_cursor > 0 && pos_cursor < 9) desc += PlayerEmbed.STATE.PLAYING;

        // not played
        for (let i = pos_cursor; i < 9; i++) {
            console.log("DESC SIZE : " + desc.length);
            desc += PlayerEmbed.STATE.NOT_PLAYED;
        }

        // end
        if (pos_cursor < 9) desc += PlayerEmbed.STATE.NOT_PLAYED_END;
        else desc += PlayerEmbed.STATE.PLAYED_END;

        desc += "  (" + song_duration_in_sec + ")";

        // Ensure description doesn't exceed 1024 characters
        if (desc.length > 1024) {
            desc = desc.substring(0, 1021) + '...';
        }

        let embed = new EmbedBuilder()
            .setAuthor({
                name: "Truck-Kun ~",
                url: "https://github.com/solareflame/camion",
                iconURL: "https://imgur.com/V3YBKuw.gif"
            })
            .setTitle(song.title + " - " + song.artist)
            .setDescription(desc)
            .setColor('#FF0033')
            .setThumbnail(song.thumbnail)
            .setURL(song.url)
            .setTimestamp();

        let buttons = new ActionRowBuilder();
        if (pause) {
            buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId("resume")
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji(PlayerEmbed.STATE.BTN_RESUME)
            );
        } else {
            buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId("pause")
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji(PlayerEmbed.STATE.BTN_PAUSE)
            );
        }

        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId("next")
                .setStyle(ButtonStyle.Danger)
                .setEmoji(PlayerEmbed.STATE.BTN_NEXT)
        );

        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId("stop")
                .setStyle(ButtonStyle.Danger)
                .setEmoji(PlayerEmbed.STATE.BTN_STOP)
        );

        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId("shuffle")
                .setStyle(ButtonStyle.Danger)
                .setEmoji(PlayerEmbed.STATE.BTN_SHUFFLE)
        );

        if (loop) {
            buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId("unloop")
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji(PlayerEmbed.STATE.BTN_UNLOOP)
            );
        } else {
            buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId("loop")
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji(PlayerEmbed.STATE.BTN_LOOP)
            );
        }

        if (this.interraction && this.interraction.isButton()) {
            console.log("EDIT BUTTON");
            let message = await this.interraction.message;
            await message.edit({ embeds: [embed], components: [buttons] });
            this.interraction.deferUpdate();
            this.interraction = null;
            return;
        }

        if (this.interraction) {
            await this.interraction.editReply({ embeds: [embed], components: [buttons] });
            this.interraction = null;
            console.log("SONG INTERACTION USED");
        } else {
            await this.channel.send({ embeds: [embed], components: [buttons] });
            console.log("SONG CHANNEL SEND");
        }
    }

    async replyAddQueue(nb) {
        if (isNaN(nb)) {
            console.error("Invalid queue number");
            return;
        }

        let embed = new EmbedBuilder()
            .setTitle(nb + " pistes ajoutées à la file d'attente")
            .setDescription("Code :")
            .setColor('#FF0000')
            .setTimestamp();

        if (this.interraction) {
            await this.interraction.editReply({ embeds: [embed] });
            this.interraction = null;
            console.log("QUEUE INTERACTION USED");
        } else {
            await this.channel.send({ embeds: [embed] });
            console.log("QUEUE CHANNEL SEND");
        }
    }
}

function convertDurationToSeconds(duration) {
    if (!duration) return 1;

    let [minutes, seconds] = duration.split(':').map(Number);
    if (isNaN(minutes) || isNaN(seconds)) {
        console.error("Invalid time format: " + duration);
        return 1;
    }
    return minutes * 60 + seconds;
}

module.exports = PlayerEmbed;
