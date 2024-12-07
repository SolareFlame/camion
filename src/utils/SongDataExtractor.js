const { spawn } = require('child_process');

class SongDataExtractor {
    /**
     * Extrait les détails d'une vidéo YouTube.
     * @param {Song} song L'objet Song contenant l'URL de la vidéo.
     * @returns {Promise<Object>} Une promesse contenant les détails de la vidéo : artiste, titre, durée.
     */
    static async extractDetails(song) {
        return new Promise((resolve, reject) => {
            const process = spawn('yt-dlp', ['-J', song.url]);

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

                        const details = {
                            artist: jsonOutput.artist || 'Inconnu',
                            title: jsonOutput.title || 'Titre non disponible',
                            duration: jsonOutput.duration ? this.formatDuration(jsonOutput.duration) : 'Durée inconnue',
                            thumbnail: jsonOutput.thumbnail || null,
                        };

                        resolve(details);
                    } catch (err) {
                        reject(`Erreur lors de l'analyse des données : ${err.message}`);
                    }
                } else {
                    reject(`Erreur yt-dlp : ${error}`);
                }
            });
        });
    }

    /**
     * Formate une durée en secondes en format "mm:ss".
     * @param {number} seconds La durée en secondes.
     * @returns {string} La durée formatée.
     */
    static formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

module.exports = SongDataExtractor;
