import { join } from 'node:path';
import { writeFileSync } from 'node:fs';
import { markdownTable } from 'markdown-table'

const QUERY_RESULT_FOLDER = "./results/";

export function resultGroupToFile(queryResultObject, queryMetaResult) {
    _resultGroupToFile(queryResultObject, false);
    _resultGroupToFile(queryMetaResult, true);
}

function _resultGroupToFile(queryResultObject, meta) {
    for (const [key, variances] of Object.entries(queryResultObject)) {
        for (const [i, variance] of Object.entries(variances)) {
            writeFileSync(join(QUERY_RESULT_FOLDER, `${key}-${Number(i) + 1}${meta === true ? ".meta" : ""}.json`), JSON.stringify(variance, null, 2));
        }
    }
}

export function resultQuery(queries) {
    for (const [key, template] of queries) {
        for (const [i, query] of template.entries()) {
            writeFileSync(join(QUERY_RESULT_FOLDER, `${key}-${i + 1}.rq`), query);
        }
    }
}

export function generateSummaryTable(queryMetaResult) {
    const table = [
        ['Query', 'Success', 'Results', 'Time (s)']
    ];
    for (const [key, variances] of Object.entries(queryMetaResult)) {
        for (const [i, variance] of Object.entries(variances)) {
            table.push(
                [`${key}-${Number(i) + 1}`, variance['error'] === null ? 'yes' : 'no', variance['results'], variance['time_seconds'].toFixed(4)]
            );
        }
    }
    const summaryTable = markdownTable(table);
    writeFileSync(join(QUERY_RESULT_FOLDER, 'README.md'), summaryTable);
}