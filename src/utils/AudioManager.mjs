import { exec } from 'child_process';
import { createAudioResource, StreamType } from '@discordjs/voice';
import { createReadStream } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import * as fs from "fs";

export async function createAudioResourceFromSong(song) {
    try {
        let tempFilePath = path.join(tmpdir(), 'audio.webm');
        await downloadAudio(song.url, tempFilePath);


        if (!fs.existsSync(tempFilePath)) {
            console.error('Fichier audio introuvable.');
            return null;
        }

        const resource = createAudioResource(createReadStream(tempFilePath), {
            inputType: StreamType.WebmOpus,
        });

        console.log('Ressource audio créée avec succès.');
        return resource;
    } catch (error) {
        console.error('Erreur lors de la création de la ressource audio :', error);
        throw error;
    }
}

async function downloadAudio(url, outputPath) {
    console.log('Téléchargement de "', url, '" dans "', outputPath, '"');

    if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
        console.log('Fichier existant supprimé');
    }

    return new Promise((resolve, reject) => {
        exec(`yt-dlp --format bestaudio[ext=webm] --output ${outputPath} ${url}`, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
            if (error) {
                console.error('Erreur yt-dlp :', stderr);
                return reject(error.message);
            }
            resolve();
        });
    });
}
