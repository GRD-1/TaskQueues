import express from 'express';
import config from 'config';
import mainRoute from './routes/main.route';
import errorHandler from './errors/handler.error';

const app = express();
const urlencodedParser = express.urlencoded({ extended: false });

errorHandler.setErrorListener();

app.use('/', urlencodedParser, mainRoute);

app.use(express.static(`${config.PROJECT_ROOT}/public`));

app.use((request, response) => {
  response.status(404).send('<main style="text-align: center; margin: 30vh 0;"><h1>#404.Page not found</h1></main>');
});

app.listen(3000, () => console.log('The server started on port 3000 ...'));
