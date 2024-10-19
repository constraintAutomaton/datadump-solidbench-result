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
execute the queries and record the results with

```sh
yarn node index.mjs
```