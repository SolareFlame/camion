const {spawn} = require('child_process');

/**
 * Extrait les détails d'une vidéo YouTube.
 * @returns {Promise<Object>} Une promesse contenant les détails de la vidéo : artiste, titre, durée.
 * @param url
 */
async function extractDetails(url) {
    console.log(`[SONGDATA EXT] : Extracting details from ${url}`);

    const process = spawn('yt-dlp', ['-J', url]);

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
                    const jsonOutput = JSON.parse(output);

                    const details = {
                        artist: jsonOutput.artist || null,
                        title: jsonOutput.title || null,
                        duration: jsonOutput.duration || null,
                        thumbnail: jsonOutput.thumbnail || null,
                    };

                    console.log(`[SONGDATA EXT] : Details extracted : ${details.artist} - ${details.title} (${details.duration})`);

                    resolve(details);
                } catch (err) {
                    reject(`[SONGDATA EXT] : ${err}`);
                }
            } else {
                reject(`[SONGDATA EXT] : ${error}`);
            }
        });
    });
}


module.exports = {extractDetails};