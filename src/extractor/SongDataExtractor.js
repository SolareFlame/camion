const { spawn } = require('child_process');

/**
 * Extrait les détails d'une playlist YouTube.
 * @param {string} url - URL de la playlist YouTube.
 * @returns {Promise<Array>} Une promesse contenant les détails des vidéos de la playlist.
 */
async function extractDetails(url) {
    console.log(`[PLAYLIST EXT] : Extracting details from ${url}`);

    const process = spawn('yt-dlp', [
        '--dump-json',
        '--skip-download',
        '--flat-playlist',
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

    return new Promise((resolve) => {
        process.on('close', (code) => {
            if (code === 0) {
                try {
                    const details = output
                        .trim()
                        .split('\n')
                        .map((line) => JSON.parse(line))
                        .map((video) => ({
                            title: video.title || 'Unknown Title',
                            duration: video.duration || 0,
                            artist: video.uploader || 'Unknown Artist',
                            thumbnail: video.thumbnail || null,
                        }));

                    console.log(`[PLAYLIST EXT] : ${details.length} videos extracted.`);
                    resolve(details);

                    console.log(details);

                } catch (err) {
                    console.error(`[PLAYLIST EXT] : Parsing error - ${err}`);
                    resolve([]);
                }
            } else {
                console.error(`[PLAYLIST EXT] : Error - ${error}`);
                resolve([]);
            }
        });
    });
}

/**
 * Extrait la miniature d'une vidéo YouTube
 * @param url - URL de la vidéo YouTube.
 * @returns {Promise<void>}
 */

async function extractThumbnail(url) {
    console.log(`[THUMBNAIL EXT] : Extracting thumbnail from ${url}`);

    const process = spawn('yt-dlp', [
        '--dump-json',
        '--skip-download',
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

    return new Promise((resolve) => {
        process.on('close', (code) => {
            if (code === 0) {
                try {
                    const videoData = JSON.parse(output.trim());
                    const thumbnail = videoData.thumbnail || null;

                    console.log(`[THUMBNAIL EXT] : Thumbnail extracted: ${thumbnail}`);
                    resolve(thumbnail);
                } catch (err) {
                    console.error(`[THUMBNAIL EXT] : Parsing error - ${err}`);
                    resolve(null);
                }
            } else {
                console.error(`[THUMBNAIL EXT] : Error - ${error}`);
                resolve(null);
            }
        });
    });
}

module.exports = { extractDetails, extractThumbnail };

