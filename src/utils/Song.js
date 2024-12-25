const SongDataExtractor = require('../extractor/SongDataExtractor');

class Song {
    constructor(url) {
        this.url = url;
        this.title = '';
        this.artist = '';
        this.duration = 0;
        this.thumbnail = '';
    }

    /**t
     * Met à jour les détails du Song en utilisant SongDataExtractor.
     * @returns {Promise<void>}
     */
    async update() {
        try {
            console.log(`[SONG UPDATE] : Updating song ${this.url}`);

            const details = await SongDataExtractor.extractDetails(this.url);

            this.title = details.title;
            this.artist = details.artist;
            this.duration = details.duration;
            this.thumbnail = details.thumbnail;
        } catch (error) {
            console.error(`[SONG UPDATE] ${error}`);
        }
    }
}

module.exports = Song;
