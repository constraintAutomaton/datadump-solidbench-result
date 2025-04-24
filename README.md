# datadump-solidbench-result

A repository to convert Solidbench dataset into a single HDT file to collect the result of the benchmark query.
The results of the queries are available at `./query-result`.

## Instalation

```sh
yarn install
```

## Usage

Generate the benchmark data with

```sh
yarn run solidbench-generate
```
There may be warning and `component.js` errors however, if the `out-fragments` folder contains `./out-fragments/http/localhost_3000/datadump.hdt`,
`./out-fragments/http/localhost_3000/datadump.hdt.index.v1-1` and `./out-fragments/http/localhost_3000/datadump.nq` the benchmark was generated correctly.

execute the queries and record the results with

```sh
yarn node index.mjs
```

The query results are located at `./results` or [online](./results)

To generate a summary table of the execution time run:

```sh
yarn node analysis.mjs
```