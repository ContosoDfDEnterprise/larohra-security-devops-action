import * as core from '@actions/core';
import * as exec from '@actions/exec';
import fetch from 'node-fetch';
import { TextDecoder } from 'util';

async function run() {
    let startTime = core.getState('PreJobStartTime');
        if (startTime == undefined) {
            throw new Error("PreJobStartTime variable not set");
        }

        let dockerVer = '';
        let dokcerEvents = '';
        let dockerImages = '';
        
        // Initialize the commands 
        await exec.exec('docker --version', null, getOptions(dockerVer));
        await exec.exec(`docker events --since ${startTime} --until ${new Date().toISOString()} --filter event=push --filter type=image --format ID={{.ID}}`, null, getOptions(dokcerEvents));
        await exec.exec('docker images --format CreatedAt={{.CreatedAt}}::Repo={{.Repository}}::Tag={{.Tag}}::Digest={{.Digest}}', null, getOptions(dockerImages));

        // Post data to URI
        let data = {
            dockerVer: dockerVer,
            dokcerEvents: dokcerEvents,
            dockerImages: dockerImages
        };
        
        const url = "https://larohratestgh.azurewebsites.net/api/EventReceiver?code=SGynGt6DsoMFGAKScOi3reAsUBiOm6xZbhmjEIqFAwytAzFuXauSeA==";

        const response = await fetch(url, {
            method: 'POST',
            body: data,
            headers: {'Content-Type': 'application/json'} });
          
          if (!response.ok) { console.log(response.statusText); }
          
          // If you care about a response:
          if (response.body !== null) {
            // body is ReadableStream<Uint8Array>
            // parse as needed, e.g. reading directly, or
            const asString = response.body.toString();
            console.log(asString);
          }

}

function getOptions(buffer: string): exec.ExecOptions {
    var options = {
        listeners: {
            stdout: (data: Buffer) => {
                buffer += data.toString();
            },
            stderr: (data: Buffer) => {
                buffer += data.toString();
            }
        }
    };
    return options;
}

run().catch((error) => {
    core.debug(error);
});
