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

Currently not able to perform the queries

```js
[
  { query: 'interactive-complex-1.sparql', v: 1 },
  { query: 'interactive-complex-1.sparql', v: 2 },
  { query: 'interactive-complex-1.sparql', v: 3 },
  { query: 'interactive-complex-1.sparql', v: 4 },
  { query: 'interactive-complex-7.sparql', v: 0 },
  { query: 'interactive-complex-7.sparql', v: 1 },
  { query: 'interactive-complex-7.sparql', v: 2 },
  { query: 'interactive-complex-7.sparql', v: 3 },
  { query: 'interactive-complex-7.sparql', v: 4 }
]
```