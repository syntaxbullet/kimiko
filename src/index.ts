import fs from 'fs'

async function helloWorld() {
    fs.promises.writeFile('./hello.txt', "This is live!", { encoding: "utf-8" });
}

helloWorld()