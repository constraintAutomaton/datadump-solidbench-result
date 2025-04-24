import { readFile, readdir, writeFile } from "node:fs/promises";
import * as Path from "node:path";
import { markdownTable } from 'markdown-table'
import {QUERY_RESULT_FOLDER} from "./output.mjs";

const files = await readdir(QUERY_RESULT_FOLDER);

const queryTemplate = [];
const templates = [
    "complex-1",
    "complex-2",
    "complex-3",
    "complex-4",
    "complex-5",
    "complex-6",
    "complex-7",
    "complex-8",
    "complex-9",
    "complex-10",
    "complex-11",
    "complex-12",
    "discover-1",
    "discover-2",
    "discover-3",
    "discover-4",
    "discover-5",
    "discover-6",
    "discover-7",
    "discover-8",
    "short-1",
    "short-2",
    "short-3",
    "short-4",
    "short-5",
    "short-6",
    "short-7",
];

for (const template of templates) {
    queryTemplate.push(`interactive-${template}`);
}

const queryMap = new Map(queryTemplate.map((template) => [template, []]));

for (const file of files) {
    for (const template of queryTemplate) {
        if (file.includes(`${template}-`) && file.includes(".meta.json")) {
            const json = await readFile(Path.join(QUERY_RESULT_FOLDER, file));
            const result = JSON.parse(json);
            queryMap.get(template).push(result["time_seconds"])
        }
    }
}


const rows = [["Template", "avg (s)", "max (s)", "min (s)",]];
for (const [key, values] of queryMap) {
    const avg = (values.reduce((a, b) => a + b) / values.length).toFixed(0);
    const max = Math.max(...values).toFixed(0);
    const min = Math.min(...values).toFixed(0);
    if(avg === "0"){
        rows.push([key, "-", "-", "-"]);
    }else{
        rows.push([key, avg, max, min]);
    }
}

const summaryTable = markdownTable(rows);
await writeFile(Path.join(QUERY_RESULT_FOLDER, 'SUMMARY_EXEC_TIME.md'), summaryTable);