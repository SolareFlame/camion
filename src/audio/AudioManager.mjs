import { spawn } from 'child_process';
import { createAudioResource, StreamType } from '@discordjs/voice';
import { PassThrough } from 'stream';

let lastErrorYtDlp = null;
let lastErrorFFmpeg = null;

/**
 * Crée une ressource audio à partir d'une chanson donnée.
 * @param {Object} song - Contient au moins une URL pour le téléchargement.
 * @returns {AudioResource|null} - La ressource audio ou null en cas d'échec.
 */
export async function createAudioResourceFromSong(song) {
    try {
        console.log(`Création de la ressource audio pour : ${song.url}`);

        const audioStream = new PassThrough();
        const ytDlpProcess = spawn('yt-dlp', ['-o', '-', '-f', 'bestaudio[ext=webm]', song.url]);

        ytDlpProcess.stderr.on('data', (data) => {
            const errorMessage = data.toString().trim();
            if (errorMessage !== lastErrorYtDlp) {
                console.error(`YT-DLP : ${errorMessage}`);
                lastErrorYtDlp = errorMessage;
            }
        });

        ytDlpProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`yt-dlp s'est terminé avec le code ${code}`);
                audioStream.end();
            }
        });


        const ffmpegProcess = spawn('ffmpeg', [
            '-i', 'pipe:0',
            '-c:a', 'libopus',
            '-b:a', '128k',
            '-f', 'webm',
            'pipe:1',
        ]);

        ytDlpProcess.stdout.pipe(ffmpegProcess.stdin);
        ffmpegProcess.stdout.pipe(audioStream);

        ffmpegProcess.stderr.on('data', (data) => {
            const errorMessage = data.toString().trim();
            if (errorMessage !== lastErrorFFmpeg) {
                console.error(`FFMPEG : ${errorMessage}`);
                lastErrorFFmpeg = errorMessage;
            }
        });

        ffmpegProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`FFmpeg s'est terminé avec le code ${code}`);
                audioStream.end();
            }
        });

        const resource = createAudioResource(audioStream, {
            inputType: StreamType.WebmOpus,
        });

        console.log('Ressource audio en streaming créée avec succès.');
        return resource;
    } catch (error) {
        console.error('Erreur lors de la création de la ressource audio :', error);
        throw error;
    }
}
