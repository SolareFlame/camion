const { spawn } = require('child_process');

/**
 * Extrait les détails d'une vidéo YouTube.
 * @param {string} url - URL de la vidéo YouTube.
 * @returns {Promise<Object>} Une promesse contenant les détails de la vidéo.
 */
async function extractDetails(url) {
    console.log(`[SONGDATA EXT] : Extracting details from ${url}`);

    const process = spawn('yt-dlp', [
        '--print',
        '{"artist": "%(artist|)s", "title": "%(title|)s", "duration": "%(duration|)s", "thumbnail": "%(thumbnail|)s"}',
        url,
    ]);

    let output = '';
    let error = '';

    process.stdout.on('data', (data) => {
        output += data.toString();
    });

    process.stderr.on('data', (data) => {
        error += data.toString();
    });

    return new Promise((resolve, reject) => {
        process.on('close', (code) => {
            if (code === 0) {
                try {
                    const details = JSON.parse(output);

                    console.log(`[SONGDATA EXT] : Details extracted : ${details.artist} - ${details.title} (${details.duration})`);

                    resolve(details);
                } catch (err) {
                    reject(`[SONGDATA EXT] : Parsing error - ${err}`);
                }
            } else {
                reject(`[SONGDATA EXT] : Error - ${error}`);
            }
        });
    });
}

module.exports = { extractDetails };
