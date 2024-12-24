import { spawn } from 'child_process';
import {AudioResource, createAudioResource, StreamType} from '@discordjs/voice';
import { PassThrough } from 'stream';

/**
 * @param url
 */
export async function createAudioStream(url){
    try {
        console.log(`[AUDIOSTREAM] : New audio stream created from ${url}`);

        const audioStream = new PassThrough();
        const ytDlpProcess = spawn('yt-dlp', [
            '-o',
            '-',
            '-f',
            'bestaudio[ext=webm]',
            url
        ]);

        ytDlpProcess.stderr.on('data', (data) => {
            console.error(`[yt-dlp] : ${data.toString().trim()}`);
        });

        ytDlpProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`[yt-dlp] edded with code ${code}`);
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
            console.error(`[ffmpeg] : ${data.toString().trim()}`);
        });

        ffmpegProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`[ffmpeg] ended with code ${code}`);
                audioStream.end();
            }
        });

        const resource = createAudioResource(audioStream, {
            metadata: undefined,
            inputType: StreamType.WebmOpus
        });

        console.log('[AUDIOSTREAM] : Audio stream created successfully');
        return resource;

    } catch (error) {
        console.error('[AUDIOSTREAM] : Error creating audio stream');
        throw error;
    }
}
