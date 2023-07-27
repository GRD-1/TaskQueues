# Task Queues
This service is designed to compare the performance of the next libraries:
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

## Environment

- OS Ubuntu-22.04
- Node.js 18.16.0
- npm 9.5.1
- Redis server 6.0.16
- fastq 1.15.0
- Bull 4.10.4
- RabbitMQ 3.12
- Docker 24.0.2
- Docker-compose 2.18.1
- the other dependencies described in the package.json

## Deploy

1. Download the project: bash git clone https://github.com/GRD-1/balance-rating.git
2. Install docker + docker-compose to your local operating system
3. ~~Get the credentials file from your system administrator, add it to the "project/config~~ (in-build for this project)
4. Using the terminal go to the project root
5. Build the docker image using the command [docker build -t task-queue-img .]
6. run the project using the [docker-compose up] command

## Settings

* the environment variables are here: config/config.ts
  * use the process.env.apikey, define the new apikey for queries to https://api.etherscan.io
  * use the process.env.logTheBenchmarks to switch off the console logging;
  * use the process.env.defaultLibrary to set the default queue library
  * use the process.env.defaultBlocksAmount to set the number of blocks loaded by default
  * use the process.env.defaultLastBlock to set the default "last block" number

## Launch 

* make sure, that you have docker and docker-compose installed
* to build the project in product mode use the command: [docker compose -f docker-compose.yml up --build]
* to build the project in development mode use the command: [docker compose -f docker-compose.dev.yml up --build]

## Usage

* After the service is launched it is available at http://localhost:3000
* to evaluate the library efficiency, use this default query: http://localhost:3000/max-balance
* to change the number of blocks for analysis use the query string parameter [blocksAmount]
  For example: http://localhost:3000/max-balance?blocksAmount=2 (by default blocksAmount = 10)
* to specify the library you want to use, change the parameter [library]
  For example: http://localhost:3000/max-balance?library=bull (by default library = fastq)
* to specify the last block number use the parameter [lastBlock]
  For example: http://localhost:3000/max-balance?lastBlock=0x10b2feb. 
  by default the application uses the number "0x10b2feb". 
  to start downloading from the last blockchain block use the expression [lastBlock]=last
  for example: <a href = "http://localhost:3000/max-balance?lastBlock=last">http://localhost:3000/max-balance?lastBlock=last</a>

## Comments

* There is a limit on the number of requests per minute in etherscan.io. For free accounts it is 5 requests per minute. 
I configured request frequency according to that rule. So, now the minimal time for one block handling is about 250 ms. 
Do not ask the service to process too many blocks, it will take a long time. 
* To monitor the process I consciously leave the console logs on. You can see it in the server terminal, 
or you can switch it off in the config file: _src/ts/config/config.ts   process.env.logBenchmarks = 'false';   
