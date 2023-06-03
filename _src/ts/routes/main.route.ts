import express from 'express';
import { MainController } from '../controllers/main.controller';
const mainRoute = express.Router();

mainRoute.get('/', (req, res) => {
  res.sendFile(`${process.env.Project_ROOT}/static/index.html`);
});

mainRoute.get('/max-balance', (req, res) => {
  const npmQueueController = new MainController();
  npmQueueController.getMaxChangedAccount(req, res);
});

export default mainRoute;
