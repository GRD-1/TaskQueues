# Task Queues
This service is designed to compare the performance of the next libraries:
* fastq https://www.npmjs.com/package/fastq
* queue https://www.npmjs.com/package/queue
* bull https://www.npmjs.com/package/bull
* rabbitMQ https://www.rabbitmq.com/

To compare them, we will use the https://etherscan.io/ api. This API allows us to get data from the Ethereum blockchain.
For each library will be performed the following sequence of tasks: 
* get the last block number using the query https://api.etherscan.io/api?module=proxy&action=eth_blockNumber
* get the last 10 blocks one by one using the query https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=0x10d4f&boolean=true
* get all transactions from each block and wallet addresses from each transaction (params: [from] and [to])
* find the wallet address whose balance has been changed the most
* return the wallet address, the balance and the performing time  

## Environment

- OS Ubuntu-22.04
- Node.js (version 18.16.0)
- npm (version 9.5.1)
- Redis server v=6.0.16 (for Bull and RabbitMQ)
- the rest in the package.json

## Deploy

1. Download the project: bash git clone https://github.com/GRD-1/balance-rating.git
2. Set up the dependencies. Call the command in the project root: bash npm install
3. Set up the Redis server (for Bull and RabbitMQ libraries)

## Settings

* the environment variables are here: _src/ts/config/config.ts
  * use the process.env.apikey, define the new apikey for queries to https://api.etherscan.io
  * use the process.env.logTheBenchmarks to switch off the console logging;

## Launch 

* to launch the project in development mode use: bash npm run start:dev
* to launch the project in product mode use: bash npm run start:prod

## Usage

* After the service is launched it is available at http://localhost:3000
* To get the most changed balance data use: http://localhost:3000/max-balance
* To change the block number use the query string parameter [blocksAmount]
  For example: http://localhost:3000/max-balance?blocksAmount=2 (by default blocksAmount = 10)
* To define the library you want to use the query string parameter [lib]
  For example: http://localhost:3000/max-balance?lib=bull (by default lib = fastq)

## Comments

* There is a limit on the number of requests per minute in etherscan.io. For free accounts it is 5 requests per minute. 
I configured request frequency according to that rule. So, now the minimal time for one block handling is about 250 ms. 
Do not ask the service to process too many blocks, it will take a long time. 
* To monitor the process I consciously leave the console logs on. You can see it in the server terminal, 
or you can switch it off in the config file: _src/ts/config/config.ts   process.env.logBenchmarks = 'false';   
