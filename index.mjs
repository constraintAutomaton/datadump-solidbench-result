import Docker from 'dockerode';
import { getQueries } from './queries.mjs';
import { getImage, runQuery } from './runner.mjs';
import { Command } from 'commander';
import { resultQuery, resultGroupToFile, generateSummaryTable } from './output.mjs'
const program = new Command();
program
  .name('datadump-solidbench-result')

  .requiredOption('-q, --queries <string...>', 'query to execute')

  .parse(process.argv);

const options = program.opts();

const queriesToExecute = new Set(options.queries);

let docker = new Docker();


await getImage(docker);

const queryResultObject = {};
const queryMetaResult = {};

const groupQueries = getQueries(queriesToExecute);
resultQuery(groupQueries)

for (const [name, queryGroup] of groupQueries) {
  queryResultObject[name] = {};
  queryMetaResult[name] = {};
  for (const [index, query] of queryGroup.entries()) {
    console.log(`query ${name} v${index} started`);
    try {
      const queryResult = await runQuery(query, docker);
      queryResultObject[name][index] = queryResult[0];
      queryMetaResult[name][index] = {
        error: null,
        results: queryResult[0].results.bindings.length,
        time_seconds: queryResult[1] / 1000
      };
      console.log(`query ${name} v${index} executed`);
    } catch (error) {
      console.log(`query ${name} v${index} failed`);
      console.error(error);
      queryMetaResult[name][index] = {
        error: error,
        results: null,
        time_seconds: null
      };
      docker = new Docker();
      await getImage(docker);
    }
    resultGroupToFile(queryResultObject, queryMetaResult);
  }
}

resultGroupToFile(queryResultObject, queryMetaResult);
generateSummaryTable(queryMetaResult);