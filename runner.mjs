import { PassThrough } from 'node:stream';
import streamToString from 'stream-to-string';
import { resolve } from 'node:path';

const COMUNICA_HDT_IMAGE = "comunica/query-sparql-hdt:latest";

export async function getImage(docker) {
    function onProgress(event) {
        console.log(event);
    }
    return new Promise((resolve, reject) => docker.pull(COMUNICA_HDT_IMAGE, {}, (error, result) => {
        if (error) {
            reject(error);
        }
        docker.modem.followProgress(result, error => error ? reject(error) : resolve(), onProgress);
    }));
}

export async function runQuery(query, docker) {
    const cmd = [
        'hdt@/data/datadump.hdt',
        '-q',
        query,
        '-t',
        'application/sparql-results+json'
    ];
    const createOptions = {
        Tty: false,
        HostConfig: {
            AutoRemove: true,
            Binds: [`${resolve("./out-fragments/http/localhost_3000")}:/data:rw`],
        },
        Entrypoint: ["node", "--max-old-space-size=18000", "./bin/query.js"]
    };
    const passThrough = new PassThrough();
    const passThroughErr = new PassThrough();
    const passThroughToString = streamToString(passThrough);
    const passThroughErrToString = streamToString(passThroughErr);

    const startQueryTime = performance.now();
    const cmdResult = await docker.run(
        COMUNICA_HDT_IMAGE,
        cmd,
        [passThrough, passThroughErr],
        createOptions,
    );

    const endQueryTime = performance.now();

    if (cmdResult[0].StatusCode) {
        throw new Error(await passThroughErrToString);
    }
    const queryResult = JSON.parse(await passThroughToString);
    return [queryResult, endQueryTime - startQueryTime];
}