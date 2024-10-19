import Docker from 'dockerode';
import { PassThrough } from 'node:stream';
import streamToString from 'stream-to-string';
import { resolve, join } from 'node:path';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const COMUNICA_HDT_IMAGE = "comunica/query-sparql-hdt:latest";
const QUERY_FOLDER = "./out-queries";
const QUERY_RESULT_FOLDER = "./query-result/"

let docker = new Docker();

async function getImage(docker) {
  function onProgress(event) {
    console.log(event);
  }
  await new Promise((resolve, reject) => docker.pull(COMUNICA_HDT_IMAGE, {}, (error, result) => {
    if (error) {
      reject(error);
    }
    docker.modem.followProgress(result, error => error ? reject(error) : resolve(), onProgress);
  }));
}

async function runQuery(query, docker) {
  const cmd = [
    'hdt@/data/datadump.hdt',
    '-q',
    query,
    '-t',
    'application/json'
  ];
  const createOptions = {
    Tty: false,
    HostConfig: {
      AutoRemove: true,
      Binds: [`${resolve("./out-fragments/http/localhost_3000")}:/data:rw`],
    },
    Entrypoint: ["node", "--max-old-space-size=16000", "./bin/query.js"]
  };
  const passThrough = new PassThrough();
  const passThroughErr = new PassThrough();
  const passThroughToString = streamToString(passThrough);
  const passThroughErrToString = streamToString(passThroughErr);

  const cmdResult = await docker.run(
    COMUNICA_HDT_IMAGE,
    cmd,
    [passThrough, passThroughErr],
    createOptions,
  )

  if (cmdResult[0].StatusCode) {
    throw new Error(`Failed to run the query ${query}:\n${await passThroughErrToString}`);
  }
  const queryResult = JSON.parse(await passThroughToString);
  return queryResult;
}

function getQueries() {
  const fileList = readdirSync(QUERY_FOLDER);
  const queries = new Map();
  for (const file of fileList) {
    const content = readFileSync(join(QUERY_FOLDER, file)).toString();
    const contentSplit = content.split("\n\n");
    queries.set(file, contentSplit);
  }
  return queries;
}

function resultGroupToFile(queryResultObject) {
  for (const [key, variance] of Object.entries(queryResultObject)) {
    writeFileSync(join(QUERY_RESULT_FOLDER, `${key}.json`), JSON.stringify(variance));
  }
}

await getImage(docker);

const queryResultObject = {};
const groupQueries = getQueries();
const errorQueries = [];
for (const [name, queryGroup] of groupQueries) {
  queryResultObject[name] = {}
  for (const [index, query] of queryGroup.entries()) {
    console.log(`query ${name} v${index} started`);
    try {
      const queryResult = await runQuery(query, docker);
      queryResultObject[name][`v${index}`] = queryResult;
      console.log(`query ${name} v${index} executed`);
    } catch (error) {
      console.log(`query ${name} v${index} failed`);
      console.error(error);
      errorQueries.push({query:name, v:index});
      docker = new Docker();
      await getImage(docker);
    }
    resultGroupToFile(queryResultObject);
  }
}

console.log(errorQueries);
resultGroupToFile(queryResultObject);
