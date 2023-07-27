import * as core from '@actions/core';
import * as exec from '@actions/exec';

async function run() {
    let startTime = core.getState('PreJobStartTime');
        if (startTime == undefined) {
            throw new Error("PreJobStartTime variable not set");
        }

        // Initialize the commands 
        await exec.exec('docker --version');
        await exec.exec(`docker events --since ${startTime} --until ${new Date().toISOString()} --filter event=push --filter type=image --format ID={{.ID}}`);
        await exec.exec('docker images --format CreatedAt={{.CreatedAt}}::Repo={{.Repository}}::Tag={{.Tag}}::Digest={{.Digest}}');
}

run().catch((error) => {
    core.debug(error);
});