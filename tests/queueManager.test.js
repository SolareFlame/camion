const QueueManager = require('../src/utils/QueueManager');
const Song = require('../src/utils/Song');

describe('QueueManager', () => {
    let queueManager;

    beforeEach(() => {
        queueManager = new QueueManager();
    });

    it('should initialize an empty queue', () => {
        const queue = queueManager.getQueue();
        expect(queue).toEqual([]);
    });

    it('should add a song to the queue', () => {
        const song = new Song('Song Title', 'http://example.com/song', 'User1');

        queueManager.addToQueue(song);
        const queue = queueManager.getQueue();

        expect(queue.length).toBe(1);
        expect(queue[0]).toEqual(song);
    });

    it('should remove a song from the queue', () => {
        const song1 = new Song('Song1', 'Ado', 200, 'http://example.com/song1');
        const song2 = new Song('Song2', 'Ado', 200, 'http://example.com/song2');

        queueManager.addToQueue(song1);
        queueManager.addToQueue(song2);

        queueManager.removeFromQueue(0); // Supprime la première chanson

        const queue = queueManager.getQueue();
        expect(queue.length).toBe(1);
        expect(queue[0]).toEqual(song2);
    });

    it('should move a song within the queue', () => {
        const song1 = new Song('Song1', 'Ado', 200, 'http://example.com/song1');
        const song2 = new Song('Song2', 'Ado', 200, 'http://example.com/song2');
        const song3 = new Song('Song3', 'Ado', 200, 'http://example.com/song3');

        queueManager.addToQueue(song1);
        queueManager.addToQueue(song2);
        queueManager.addToQueue(song3);

        queueManager.moveInQueue(3,1);

        const queue = queueManager.getQueue();
        expect(queue[0]).toEqual(song3);
        expect(queue[1]).toEqual(song1);
        expect(queue[2]).toEqual(song2);
    });

    it('should shuffle the queue', () => {
        const songs = [
            new Song('Song1', 'http://example.com/song1', 'User1'),
            new Song('Song2', 'http://example.com/song2', 'User2'),
            new Song('Song3', 'http://example.com/song3', 'User3'),
            new Song('Song4', 'http://example.com/song4', 'User4'),
        ];

        songs.forEach(song => queueManager.addToQueue(song));
        queueManager.shuffleQueue();

        const queue = queueManager.getQueue();

        // Vérifie que toutes les chansons sont présentes mais dans un ordre différent
        expect(queue.length).toBe(songs.length);
        songs.forEach(song => {
            expect(queue).toContainEqual(song);
        });

        // Ce test suppose que la file sera modifiée, ce qui n'est pas garanti
        expect(queue).not.toEqual(songs);
    });

    it('should clear the queue', () => {
        const song = new Song('Song Title', 'http://example.com/song', 'User1');

        queueManager.addToQueue(song);
        queueManager.clearQueue();

        const queue = queueManager.getQueue();
        expect(queue).toEqual([]);
    });

    it('should get the queue size', () => {
        const song1 = new Song('Song1', 'Ado', 200, 'http://example.com/song1');
        const song2 = new Song('Song2', 'Ado', 200, 'http://example.com/song2');

        queueManager.addToQueue(song1);
        queueManager.addToQueue(song2);

        const queueSize = queueManager.getQueueSize();
        expect(queueSize).toBe(2);
    });
});
