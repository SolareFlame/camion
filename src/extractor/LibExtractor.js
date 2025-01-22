const fs = require('fs');
const path = require('path');

function loadSpecialPlays() {
    try {
        const filePath = path.join(__dirname, 'lib.json');
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('[LOAD JSON] : Erreur lors du chargement de lib.json', error);
        return [];
    }
}
function getUrlFromJson(name) {
    const specialPlays = loadSpecialPlays();
    const entry = specialPlays.find((item) => item.name === name);

    if (entry) {
        console.log(`[COMMAND PLAY] : URL trouvée pour '${name}' -> ${entry.url}`);
        return entry.url;
    } else {
        console.warn(`[COMMAND PLAY] : Aucun URL trouvé pour '${name}'`);
        return null;
    }
}

module.exports = { getUrlFromJson };