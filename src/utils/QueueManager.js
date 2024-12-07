class QueueManager {
    constructor() {
        this.queue = [];
    }

    getQueue() {
        return this.queue;
    }

    addToQueue(song) {
        this.queue.push(song);
    }

    removeFromQueue(index) {
        if (index < 0 || index >= this.queue.length) return;
        this.queue.splice(index, 1);
    }

    clearQueue() {
        this.queue = [];
    }

    moveInQueue(from, to) {
        if (from < 1 || from > this.queue.length || to < 1 || to > this.queue.length) return;

        const [song] = this.queue.splice(from - 1, 1);
        this.queue.splice(to - 1, 0, song);
    }

    shuffleQueue() {
        for (let i = this.queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
        }
    }

    getQueueSize() {
        return this.queue.length;
    }

    getSong(index) {
        if (index < 0 || index >= this.queue.length) return null;
        return this.queue[index];
    }

    deleteSong(index) {
        if (index < 0 || index >= this.queue.length) return;
        this.queue.splice(index, 1);
    }

    displayQueue() {
        let queueString = 'File d\'attente:\n';
        this.queue.forEach((song, index) => {
            queueString += `${index + 1}. ${song.title}\n`;
        });
        return queueString;
    }
}

module.exports = QueueManager;
