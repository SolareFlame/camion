const { PassThrough, Readable } = require('stream');
const { createAudioResource, StreamType } = require('@discordjs/voice');
const { spawn } = require('child_process');

/**
 * @param url
 * @returns {Promise<Readable>}
 */
async function createAudioStream(url) {
    return new Promise((resolve, reject) => {
        try {
            console.log(`[AUDIOSTREAM] : New audio stream created from ${url}`);

            const audioBuffer = [];
            const process = spawn('yt-dlp', [
                '-o',
                '-',
                '-f',
                'bestaudio[ext=webm]',
                '--no-post-overwrites',
                '--external-downloader', 'aria2c',
                '--external-downloader-args', '-x 16',
                url
            ]);

            process.stdout.on('data', (chunk) => {
                audioBuffer.push(chunk);
            });

            process.stderr.on('data', (data) => {
                console.error(`${data}`);
            });

            process.on('close', (code) => {
                if (code === 0) {
                    console.log('[yt-dlp] : Process ended successfully');
                    const audioStream = Readable.from(Buffer.concat(audioBuffer));
                    const resource = createAudioResource(audioStream, {
                        inputType: StreamType.WebmOpus,
                    });

                    console.log('[AUDIOSTREAM] : Audio stream created successfully');
                    resolve(resource);
                } else {
                    reject(new Error(`[yt-dlp] : Process ended with code ${code}`));
                }
            });

        } catch (error) {
            console.error('[AUDIOSTREAM] : Error creating audio stream');
            reject(error);
        }
    });
}

module.exports = { createAudioStream };
