import { createAudioResource } from '@discordjs/voice';

async function createAudioResourceFromSong(song) {
    try {
        // Vérifier si l'URL est valide
        if (!song.url || !song.url.startsWith('http')) {
            console.error("URL invalide ou inaccessible: " + song.url);
            return null;
        }

        console.log("URL valide: " + song.url);

        // Utiliser import() dynamique pour charger yt-dlp-wrapper
        const ytDlpWrapper = await import('yt-dlp-wrapper');  // import dynamique

        // Utiliser yt-dlp-wrapper pour récupérer les informations de la vidéo
        const video = await ytDlpWrapper.getInfo(song.url);
        if (!video || !video.url) {
            console.error("Aucun flux audio trouvé pour la vidéo.");
            return null;
        }

        console.log("Flux audio récupéré avec succès.");

        // Créer la ressource audio compatible Discord
        const stream = ytDlpWrapper.stream(song.url); // Récupérer le flux audio
        const resource = createAudioResource(stream, {
            inputType: 'unknown', // Flux arbitraire
        });

        console.log("Ressource audio créée avec succès.");
        return resource;
    } catch (error) {
        console.error("Erreur lors de la création de la ressource audio :", error);
        return null;
    }
}

export { createAudioResourceFromSong };
