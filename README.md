# Task Queues
This service is designed to compare the performance of the following libraries:
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
- toad-scheduler 3.0.0
- Docker 24.0.2
- Docker-compose 2.18.1
- the other dependencies described in the package.json

## Deploy <a id="deploy"></a>

1. Download the project: bash git clone https://github.com/GRD-1/balance-rating.git
2. Install docker + docker-compose to your local operating system
3. Using the terminal go to the project root
4. Build project in product mode using the command [ docker-compose -f docker-prod.yml up --build ]
5. Build project in development mode using the command [ docker-compose -f docker-dev.yml up --build ]

## Settings

* the environment variables are here: config/
  * to set new apikey for https://api.etherscan.io, change the variable __[ ETHERSCAN_APIKEY ]__ in config/local-*.cjs
  * to switch off the logging, change the variable __[ LOG_BENCHMARKS ]__ in config/default.cjs
  * to set the default queue library use the variable __[ DEFAULT_QUERY.LIBRARY ]__ in config/default.cjs
  * to set the number of blocks loaded by default use the variable __[ DEFAULT_QUERY.BLOCKS_AMOUNT ]__ in config/default.cjs
  * to set the default "last block" number use the variable __[ DEFAULT_QUERY.LAST_BLOCK ]__ in config/default.cjs

## Launch 

* if you launch the project for the first time, you just need to follow the instructions from chapter [Deploy](#deploy), 
project will be launched automatically
* if you already have the built docker image set use the command:
  * [ docker-compose -f docker-prod.yml up ] for product mode
  * [ docker-compose -f docker-dev.yml up ] for development mode
* to stop the project use the command:
  * [ docker-compose -f docker-prod.yml down ] for product mode
  * [ docker-compose -f docker-dev.yml down ] for development mode

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

* All tests are here: _src/test
* html coverage report will be here: _src/test/coverage

* to run tests in local mode:
  * To run unit tests use the command: [ npm run test:unit ]
  * To run integration tests use the command: [ npm run test:int ]
  * To run a specific test use the command: [ jest <pathToSpecificTest> ]
  * To run all tests and get the coverage map use the command: [ npm run test:cov ]

* to run tests in docker mode:
  * Build the project in development mode using the command [ docker-compose -f docker-dev.yml up --build ]
  * To run unit tests use the command: [ docker exec -it taskqueues-node-1 npm run test:unit ]
  * To run integration tests use the command: [ docker exec -it taskqueues-node-1 npm run test:int ]
  * To run a specific test use the command: [ docker exec -it taskqueues-node-1 jest <pathToSpecificTest> ]
  * To run all tests and get the coverage map use the command: [ docker exec -it taskqueues-node-1 npm run test:cov ]

## Comments

* There is a limit on the number of requests per minute in etherscan.io. For free accounts it is 5 requests per minute. 
I configured request frequency according to that rule. So, now the minimal time for one block handling is about 250 ms. 
Do not ask the service to process too many blocks, it will take a long time. 
* To monitor the process I consciously leave the console logs on. You can see it in the server terminal, 
or you can switch it off in the config file: config/default.cjs LOG_BENCHMARKS = 'false';   
