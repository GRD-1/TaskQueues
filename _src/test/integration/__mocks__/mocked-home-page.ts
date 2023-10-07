export const MOCKED_HOME_PAGE = `<!DOCTYPE html>
  <html lang="en">
<head>
  <meta charset="UTF-8">
<link rel="stylesheet" href="/styles.css">
  <title>Home page</title>
</head>
<body>
<main>
  <h1>The main page of task-queues application</h1>
<div>
<br> This service is designed to compare the performance of the next libraries:
  <a href = "https://www.npmjs.com/package/fastq">fastq</a>,
    <a href = "https://www.npmjs.com/package/bullq">bull</a>,
  <a href = "https://www.rabbitmq.com/">rabbitMQ</a>

  <br>To compare them, we will use the <a href = "https://etherscan.io/">https://etherscan.io api</a>. This API allows us to get data from the Ethereum blockchain.
<br>
  <br>For each library will be performed the following sequence of tasks:
  <ul>
    <li>get the last 10 blocks of the blockchain one by one, starting from the specified</li>
<li>get all transactions from each block and wallet addresses from each transaction (params: <b>[from]</b> and <b>[to])</b></li>
<li>find the wallet address whose balance has been changed the most as a result of transactions</li>
<li>return the wallet address, the balance and the performing time</li>
</ul>
</div>
<div>
<h2>Usage</h2>
<br>to evaluate the library efficiency, use this default query:
  <ul>
    <li><a href = "http://localhost:3000/max-balance?library=fastq">http://localhost:3000/max-balance?library=fastq</a></li>
<li><a href = "http://localhost:3000/max-balance?library=bull">http://localhost:3000/max-balance?library=bull</a></li>
<li><a href = "http://localhost:3000/max-balance?library=rabbitmq">http://localhost:3000/max-balance?library=rabbitmq</a></li>
</ul>

<br>to change the number of blocks for analysis use the query string parameter <b>[blocksAmount]</b>,
<br>for example: <a href = "http://localhost:3000/max-balance?blocksAmount=2">http://localhost:3000/max-balance?blocksAmount=2</a> (default value is 10)
<br>
  <br>to specify the library you want to use, change the parameter <b>[library]</b>,
<br>for example: <a href = "http://localhost:3000/max-balance?library=bull">http://localhost:3000/max-balance?library=bull</a> (by default library = fastq)
<br>
  <br>to specify the last block number use the parameter <b>[lastBlock]</b>,
<br>for example: <a href = "http://localhost:3000/max-balance?lastBlock=0x10b2feb">http://localhost:3000/max-balance?lastBlock=0x10b2feb</a>
<br>by default the application uses the number "0x10b2feb"
<br>to start downloading from the last blockchain block use the expression [lastBlock]=last
  <br>for example: <a href = "http://localhost:3000/max-balance?lastBlock=last">http://localhost:3000/max-balance?lastBlock=last</a>
</div>
</main>
</body>
</html>
`;
