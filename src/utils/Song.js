class Song {
    constructor (title, artist, duration, url) {
        this.title = title
        this.artist = artist
        this.duration = duration //en secondes
        this.url = url
    }

    getName () {
        return this.title
    }

    getArtist () {
        return this.artist
    }

    getDuration () {
        return this.duration
    }

    getUrl () {
        return this.url
    }
}

module.exports = Song;