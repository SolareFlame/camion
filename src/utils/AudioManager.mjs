import { spawn } from 'child_process';
import { createAudioResource, StreamType } from '@discordjs/voice';
import { Readable } from 'stream';

/**
 * Crée une ressource audio à partir d'une chanson donnée.
 * @param {Object} song - Contient au moins une URL pour le téléchargement.
 * @returns {AudioResource|null} - La ressource audio ou null en cas d'échec.
 */
export async function createAudioResourceFromSong(song) {
    try {
        console.log(`Création de la ressource audio pour : ${song.url}`);
        const audioBuffer = await downloadAudioToBuffer(song.url);

        const resource = createAudioResource(Readable.from(audioBuffer), {
            inputType: StreamType.WebmOpus,
        });

        console.log('Ressource audio créée avec succès.');
        return resource;
    } catch (error) {
        console.error('Erreur lors de la création de la ressource audio :', error);
        throw error;
    }
}

/**
 * Télécharge l'audio d'une URL dans un buffer.
 * @param {string} url - L'URL de l'audio.
 * @returns {Promise<Buffer>} - Retourne un buffer contenant les données audio.
 */
async function downloadAudioToBuffer(url) {
    console.log(`Téléchargement de l'audio depuis : ${url}`);
    return new Promise((resolve, reject) => {
        const audioBuffer = [];
        const process = spawn('yt-dlp', ['--format', 'bestaudio[ext=webm]', '-o', '-', url]);

        process.stdout.on('data', (chunk) => {
            audioBuffer.push(chunk);
        });

        process.stderr.on('data', (data) => {
            console.error(`${data}`);
        });

        process.on('close', (code) => {
            if (code === 0) {
                console.log('Téléchargement réussi.');
                resolve(Buffer.concat(audioBuffer));
            } else {
                reject(new Error(`yt-dlp s'est terminé avec le code ${code}`));
            }
        });

        process.on('error', (error) => {
            reject(new Error(`Erreur lors du lancement de yt-dlp : ${error.message}`));
        });
    });
}
