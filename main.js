const fs = require('fs');
const youtubedl = require('youtube-dl-exec');
const readline = require('readline');
const path = require('path');

let playlistUrl = '';
let outputDir = './audio';

// Создаем выходную директорию, если она не существует
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}


const input = (Readline, text) => {
    const result = new Promise((resolve) => {
        Readline.question(text, res => {
            resolve(res);
        });
    });
    return result;
};

const Readline = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function program() {

    playlistUrl = await input(Readline, 'Playlist url:');
    playlistUrl = playlistUrl.replace('music.youtube', 'www.youtube');
    outputDir = await input(Readline, 'Output dir(./audio - default):');
    if (!outputDir) {
        outputDir = './audio'
    }
    Readline.close();
    
    // Создаем объект youtubedl для загрузки плейлиста
    try {
        const playlist = await youtubedl(playlistUrl, {
            flatPlaylist: true,
            dumpSingleJson: true,
            skipDownload: true,
        });

        let i = 0, count = playlist.entries.length;
        console.log('STARTING, count:', count);
        for (let x of playlist.entries) {
            i++;
            try {
                let filename = sanitizeFilename(x.title + '.mp3');
                const options = {
                    extractAudio: true,
                    audioFormat: 'mp3',
                    output: path.resolve(outputDir, filename)
                };
                await youtubedl(x.url, options);
                console.log(`${i}/${count}, OK`);
            } catch (error) {
                console.log(`${i}/${count}, FAIL`, error, x);
            }
        }
    } catch (ex) {
        console.log(ex);
    }
}

program();
// Функция для очистки имени файла от недопустимых символов
function sanitizeFilename(filename) {
    return filename.replace(/[<>:"\/\\|?*]/g, '');
}
