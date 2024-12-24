const Song = require('../utils/Song');

class PlaylistExtractor {
    /**
     * Extrait les URLs de vidéos d'une playlist YouTube.
     * @returns {Promise<string[]>} Une promesse contenant une liste d'URLs de vidéos.
     * @param url
     */
    static async getPlaylistURLs(url) {
        return new Promise((resolve, reject) => {
            const process = spawn('yt-dlp', ['--flat-playlist', '-J', url]);

            let output = '';
            let error = '';

            process.stdout.on('data', (data) => {
                output += data.toString();
            });

            process.stderr.on('data', (data) => {
                error += data.toString();
            });

            process.on('close', (code) => {
                if (code === 0) {
                    try {
                        const jsonOutput = JSON.parse(output);
                        const videoUrls = jsonOutput.entries.map(
                            (entry) => `https://www.youtube.com/watch?v=${entry.id}`
                        );
                        resolve(videoUrls);
                    } catch (err) {
                        reject(`Erreur lors de l'analyse des données : ${err.message}`);
                    }
                } else {
                    reject(`Erreur yt-dlp : ${error}`);
                }
            });
        });
    }
}

module.exports = PlaylistExtractor;


