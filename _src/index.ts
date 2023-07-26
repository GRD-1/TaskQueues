import express from 'express';
import PROJECT_ROOT from './utils/set-project-root.util';
import mainRoute from './routes/main.route';

const app = express();
const urlencodedParser = express.urlencoded({ extended: false });

// routers
app.use('/', urlencodedParser, mainRoute);

// public files storage
app.use(express.static(`${PROJECT_ROOT}/public`));

// #404. page not found
app.use((request, response) => {
  response.status(404).send('<main style="text-align: center; margin: 30vh 0;"><h1>#404.Page not found</h1></main>');
});

app.listen(3000, () => console.log('The server started on port 3000 ...'));
