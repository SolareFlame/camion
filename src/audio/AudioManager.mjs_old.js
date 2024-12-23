import { exec } from 'child_process';
import { createAudioResource, StreamType } from '@discordjs/voice';
import { createReadStream } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import * as fs from 'fs/promises';

/**
 * Crée une ressource audio à partir d'une chanson donnée.
 * @param {Object} song - Contient au moins une URL pour le téléchargement.
 * @returns {AudioResource|null} - La ressource audio ou null en cas d'échec.
 */
export async function createAudioResourceFromSong(song) {
    const tempFilePath = path.join(tmpdir(), `audio_${Date.now()}.webm`);

    try {
        await downloadAudio(song.url, tempFilePath);

        const resource = createAudioResource(createReadStream(tempFilePath), {
            inputType: StreamType.WebmOpus,
        });

        console.log('Ressource audio créée avec succès.');
        return resource;
    } catch (error) {
        console.error('Erreur lors de la création de la ressource audio :', error);
        throw error;
    } finally {
        // Nettoyage du fichier temporaire
        await clearTempFiles(tempFilePath);
    }
}

/**
 * Télécharge l'audio d'une URL dans le fichier spécifié.
 * @param {string} url - L'URL de l'audio.
 * @param {string} outputPath - Chemin de destination pour le fichier téléchargé.
 * @returns {Promise<void>}
 */
async function downloadAudio(url, outputPath) {
    console.log(`Téléchargement de "${url}" dans "${outputPath}"`);

    await clearTempFiles(outputPath);

    return new Promise((resolve, reject) => {
        exec(
            `yt-dlp --format bestaudio[ext=webm] --output ${outputPath} ${url}`,
            { maxBuffer: 10 * 1024 * 1024 },
            (error, stdout, stderr) => {
                if (error) {
                    console.error('Erreur yt-dlp :', stderr);
                    return reject(new Error(`Échec du téléchargement avec yt-dlp : ${stderr}`));
                }
                console.log(`Téléchargement réussi : ${outputPath}`);
                resolve();
            }
        );
    });
}

/**
 * Supprime un fichier temporaire s'il existe.
 * @param {string} filePath - Chemin du fichier temporaire.
 */
export async function clearTempFiles(filePath) {
    try {
        await fs.access(filePath);
        await fs.unlink(filePath);
        console.log(`Fichier temporaire supprimé : ${filePath}`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`Aucun fichier temporaire trouvé à supprimer : ${filePath}`);
        } else {
            console.error(`Erreur lors de la suppression du fichier temporaire (${filePath}):`, error);
        }
    }
}
