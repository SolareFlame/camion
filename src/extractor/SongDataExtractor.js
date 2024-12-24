const { spawn } = require('child_process');

class SongDataExtractor {
    /**
     * Extrait les détails d'une vidéo YouTube.
     * @returns {Promise<Object>} Une promesse contenant les détails de la vidéo : artiste, titre, durée.
     * @param url
     */
    static async extractDetails(url)  {
        return new Promise((resolve, reject) => {
            const process = spawn('yt-dlp', ['-J', url]);

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
                            duration: jsonOutput.duration || 'Durée non disponible',
                            thumbnail: jsonOutput.thumbnail || null,
                        };

                        resolve(details);
                    } catch (err) {
                        reject(`Erreur lors de l'analyse des données : ${err}`);
                    }
                } else {
                    reject(`Erreur yt-dlp : ${error}`);
                }
            });
        });
    }
}
module.exports = SongDataExtractor;