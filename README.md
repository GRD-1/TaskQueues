# Task Queues
This service is designed to practice for work with the task queues. It includes the following queue libraries:
* fastq https://www.npmjs.com/package/fastq
* bull https://www.npmjs.com/package/bull
* rabbitMQ https://www.rabbitmq.com/

To compare them, we will use the https://etherscan.io/ api. This API allows us to get data from the Ethereum blockchain.
For each library will be performed the following sequence of tasks: 
* get the last 10 blocks one by one using the query https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=0x10d4f&boolean=true
* get all transactions from each block and wallet addresses from each transaction (params: [from] and [to])
* find the wallet address whose balance has been changed the most
* return the wallet address, the balance and the performing time  

The processing time starts counting from the moment the data is completely loaded.

<br>
<p style="display: block; width: 100%; text-align:left;">
  <a href="https://nodejs.org/en/about" target="_blank"><img src="https://img.shields.io/badge/Node.js-v18.16.0-blue?logo=nodedotjs" alt="Node.js Version" /></a>
  <a href="https://www.typescriptlang.org/" target="_blank"><img src="https://img.shields.io/badge/TypeScript-v4.7.4-blue?logo=typescript" alt="TypeScript Version" /></a>
  <a href="" target="_blank"><img src="https://img.shields.io/badge/covarage-91.92%20-%2300c642?style=flat" alt="Coverage" /></a>
  <a href="" rel="nofollow"><img src="https://img.shields.io/badge/istall_size-236%20KB-%23ebdb32?style=flat" alt="install size"></a>
</p>

## Contents
1. [Stack](#Stack)
2. [Settings](#settings)
3. [Launch](#launch)
4. [Usage](#usage)
5. [Tests](#tests)
6. [Comments](#comments)

## Stack

<div>
    <div>
      <div style="display: flex; flex-wrap: wrap; height: 200px;">
        <div style="width: 40%; height: fit-content;"><a href="https://ubuntu.com/" target="_blank"><img src="https://img.shields.io/badge/Linux_Ubuntu-v22.04-blue?style=for-the-badge&logo=ubuntu" alt="Linux Ubuntu Version" /></a></div>
        <div style="width: 40%; height: fit-content;"><a href="https://jestjs.io/" target="_blank"><img src="https://img.shields.io/badge/Jest-v29.0.5-blue?style=for-the-badge&logo=jest" alt="Jest Version" /></a></div>
        <div style="width: 40%; height: fit-content;"><a href="https://www.docker.com/products/docker-desktop/" target="_blank"><img src="https://img.shields.io/badge/docker-v24.0.2-blue?style=for-the-badge&logo=docker" alt="Docker Version" /></a></div>
        <div style="width: 40%; height: fit-content;"><a href="https://www.npmjs.com/package/supertest" target="_blank"><img src="https://img.shields.io/badge/supertest-v6.1.3-blue?style=for-the-badge" alt="Supertest Version" /></a></div>
        <div style="width: 40%; height: fit-content;"><a href="https://nodejs.org/en/about" target="_blank"><img src="https://img.shields.io/badge/Node.js-v18.16.0-blue?style=for-the-badge&logo=nodedotjs" alt="Node.js Version" /></a></div>
        <div style="width: 40%; height: fit-content;"><a href="https://eslint.org/" target="_blank"><img src="https://img.shields.io/badge/eslint-v8.51.0-blue?style=for-the-badge&logo=eslint" alt="Eslint Version" /></a></div>
        <div style="width: 40%; height: fit-content;"><a href="https://www.typescriptlang.org/" target="_blank"><img src="https://img.shields.io/badge/TypeScript-v4.7.4-blue?style=for-the-badge&logo=typescript" alt="TypeScript Version" /></a></div>
        <div style="width: 40%; height: fit-content;"><a href="https://prettier.io/" target="_blank"><img src="https://img.shields.io/badge/prettier-v2.3.2-blue?style=for-the-badge&logo=prettier" alt="Prettier Version" /></a></div>
        <div style="width: 40%; height: fit-content;"><a href="https://www.npmjs.com/" target="_blank"><img src="https://img.shields.io/badge/npm-v9.5.1-blue?style=for-the-badge&logo=npm" alt="npm Version" /></a></div>
        <div style="width: 40%; height: fit-content;"><a href="https://redis.io/" target="_blank"><img src="https://img.shields.io/badge/Redis-v6.0.16-blue?style=for-the-badge&logo=redis" alt="Redis Version" /></a></div>
        <div style="width: 40%; height: fit-content;"><a href="https://www.npmjs.com/package/fastq" target="_blank"><img src="https://img.shields.io/badge/fastq-v1.15.0-blue?style=for-the-badge" alt="Fastq Version" /></a></div>
        <div style="width: 40%; height: fit-content;"><a href="https://www.npmjs.com/package/bull" target="_blank"><img src="https://img.shields.io/badge/bull-v4.10.4-blue?style=for-the-badge" alt="Bull Version" /></a></div>
        <div style="width: 40%; height: fit-content;"><a href="https://www.rabbitmq.com/" target="_blank"><img src="https://img.shields.io/badge/RabbitMQ-v3.12-blue?style=for-the-badge&logo=rabbitmq" alt="RabbitMQ Version" /></a></div>
        </div>
    </div>
</div>
<br>

## Launch

The project is prepared to launch via the docker.You need to install
<a href="https://www.docker.com/products/docker-desktop/" target="_blank">Docker</a>
and then run the corresponding command in the terminal.

* for development mode use:
``` bash
$ docker stop $(docker ps -aq)
$ docker-compose -f ./devops/docker-compose.yml --env-file ./devops/env/.env.dev up -d
$ docker logs task_queues-node-dev -f --tail 30
```
* for debug mode use:
``` bash
$ docker stop $(docker ps -aq)
$ docker-compose -f ./devops/docker-compose.yml --env-file ./devops/env/.env.debug up -d
$ docker logs task_queues-node-debug -f --tail 30
```
* for product mode use:
``` bash
$ docker stop $(docker ps -aq)
$ docker-compose -f ./devops/docker-compose.yml --env-file ./devops/env/.env.prod up -d
```
* for test mode use:
``` bash
$ docker stop $(docker ps -aq)
$ docker-compose -f ./devops/docker-compose.yml --env-file ./devops/env/.env.test up -d
```

## Settings

* the environment variables are here: config/
  * to set new apikey for https://api.etherscan.io, change the variable __[ ETHERSCAN_APIKEY ]__ in config/local-*.cjs
  * to switch off the logging, change the variable __[ LOG_BENCHMARKS ]__ in config/default.cjs
  * to set the default queue library use the variable __[ DEFAULT_QUERY.LIBRARY ]__ in config/default.cjs
  * to set the number of blocks loaded by default use the variable __[ DEFAULT_QUERY.BLOCKS_AMOUNT ]__ in config/default.cjs
  * to set the default "last block" number use the variable __[ DEFAULT_QUERY.LAST_BLOCK ]__ in config/default.cjs

## Usage

* After the service is launched it is available at http://localhost:3000
* to evaluate the library efficiency, use this default queries: 
  * http://localhost:3000/max-balance?library=fastq
  * http://localhost:3000/max-balance?library=bull
  * http://localhost:3000/max-balance?library=rabbitmq
* to change the number of blocks for analysis use the query string parameter [blocksAmount]
  For example: http://localhost:3000/max-balance?blocksAmount=10 (by default blocksAmount = 3)
* to specify the library you want to use, change the parameter [library]
  For example: http://localhost:3000/max-balance?library=bull (by default library = fastq)
* to specify the last block number use the parameter [lastBlock]
  For example: http://localhost:3000/max-balance?lastBlock=0x10b2feb. 
  by default the application uses the number "0x10b2feb". 
  to start downloading from the last blockchain block use the expression [lastBlock]=last
  for example: <a href = "http://localhost:3000/max-balance?lastBlock=last">http://localhost:3000/max-balance?lastBlock=last</a>

## Tests

* To perform the tests you need to be loaded in [Test mode](#Launch). It's important because the tests use a database (!)

```bash
# unit tests
$ docker exec -it task_queues-node-test npm run test:unit
```

```bash
# integration tests
$ docker exec -it task_queues-node-test npm run test:int
```

```bash
# test coverage
$ docker exec -it task_queues-node-test npm run test:cov
```

## Comments

* There is a limit on the number of requests per minute in etherscan.io. For free accounts it is 5 requests per minute. 
I configured request frequency according to that rule. So, now the minimal time for one block handling is about 250 ms. 
Do not ask the service to process too many blocks, it will take a long time. 
* To monitor the process I consciously leave the console logs on. You can see it in the server terminal, 
or you can switch it off in the config file: config/default.cjs LOG_BENCHMARKS = 'false';   
