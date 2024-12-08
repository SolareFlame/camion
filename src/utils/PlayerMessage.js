const {EmbedBuilder} = require("discord.js");

class PlayerMessage {
    static STATE = Object.freeze({
        PLAYING_START : '<:playing_start:1315319232493523035>',
        PLAYED_START : '<:played_start:1315317278669017109>',

        PLAYED : '<:played:1315317305047253083>',
        PLAYING : '<:playing:1315317325947207771>',
        NOT_PLAYED : '<:notplayed:1315324031095803925>',

        NOT_PLAYED_END : '<:notplayed_end:1315324012385144872>',
        PLAYED_END : '<:played_end:1315317390606598154>'
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

    async replyPlay(song, duration) {
        let song_duration_in_sec = convertDurationToSeconds(song.duration);

        let desc = "(" + (song_duration_in_sec - duration) + ")  ";
        let pos_cursor = Math.round(duration / song_duration_in_sec * 9);

        console.log("POS CURSOR : " + pos_cursor);
        console.log("DURATION : " + duration);
        console.log("SONG DURATION : " + song_duration_in_sec);

        //start
        if(pos_cursor < 1) desc += PlayerMessage.STATE.PLAYING_START;
        else desc += PlayerMessage.STATE.PLAYED_START;

        //played
        for(let i = 0; i < pos_cursor - 1; i++) {
            desc += PlayerMessage.STATE.PLAYED;
        }

        //playing
        if(pos_cursor > 0 && pos_cursor < 9) desc += PlayerMessage.STATE.PLAYING;

        //not played
        for(let i = pos_cursor; i < 9; i++) {
            desc += PlayerMessage.STATE.NOT_PLAYED;
        }

        //end
        if(pos_cursor < 9) desc += PlayerMessage.STATE.NOT_PLAYED_END;
        else desc += PlayerMessage.STATE.PLAYED_END;

        desc += "  (" + song_duration_in_sec + ")";

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


        if (this.interraction) {
            await this.interraction.editReply({embeds: [embed]});
            this.interraction = null;

            console.log("SONG INTERACTION USED")
        } else {
            await this.channel.send({embeds: [embed]});

            console.log("SONG CHANNEL SEND")
        }
    }


    async replyAddQueue(nb) {
        let embed = new EmbedBuilder()
            .setTitle(nb + " pistes ajoutées à la file d'attente")
            .setDescription("Code :")
            .setColor('#FF0000')
            .setTimestamp();


        if (this.interraction) {
            await this.interraction.editReply({embeds: [embed]});
            this.interraction = null;

            console.log("QUEUE INTERACTION USED")
        } else {
            await this.channel.send({embeds: [embed]});

            console.log("QUEUE CHANNEL SEND")
        }
    }
}

function convertDurationToSeconds(duration) {
    let [minutes, seconds] = duration.split(':').map(Number);
    return minutes * 60 + seconds;
}

module.exports = PlayerMessage;
