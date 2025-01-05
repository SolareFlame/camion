const Song = require('./Song');

class QueueManager {
    #queue;

    constructor() {
        this.queue = [];
    }

    addToQueue(song) {
        this.queue.push(song);
    }

    addToQueueNext(song) {
        this.queue.splice(1, 0, song);
    }

    removeFromQueue(index) {
        if (index < 0 || index >= this.queue.length) return;
        this.queue.splice(index, 1);
    }

    clearQueue(){
        this.queue = [];
    }

    moveInQueue(from, to)  {
        if (from < 1 || from > this.queue.length || to < 1 || to > this.queue.length) return;

        const [song] = this.queue.splice(from - 1, 1);
        this.queue.splice(to - 1, 0, song);
    }

    shuffleQueue()  {
        for (let i = this.queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
        }
    }

    getQueueSize(){
        return this.queue.length;
    }

    getSong(index)  {
        if (index < 0 || index >= this.queue.length) return null;
        return this.queue[index];
    }

    deleteSong(index){
        if (index < 0 || index >= this.queue.length) return;
        this.queue.splice(index, 1);
    }

    displayQueue(page){
        let queueString = '';

        const pageSize = Math.min(10, this.queue.length - (page - 1) * 10);
        const startIndex = (page - 1) * 10;

        for (let i = startIndex; i < startIndex + pageSize; i++) {
            const song = this.queue[i];

            if(song.duration === 0) {
                queueString += `${i + 1}. \`${song.url}\` (loading).\n`;
            } else {
                queueString += `${i + 1}. [${song.title}](${song.url}) (${song.duration}).\n`;
            }
        }
        return queueString;
    }

    getPageCount() {
        return Math.ceil(this.queue.length / 10);
    }

    nextSong() {
        if(this.isEmpty()) return null;
        return this.queue.shift();
    }

    isEmpty() {
        return this.queue.length === 0;
    }

    updateQueue() {
        this.queue.forEach((song) => {
            song.updateSong();
        });
    }
}

module.exports = QueueManager;