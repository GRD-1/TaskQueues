import express from 'express';
import config from 'config';
import { MaxBalanceController } from '../controllers/max-balance.controller';
const mainRoute = express.Router();

mainRoute.get('/', (req, res) => {
  res.status(301).redirect('/home');
});

mainRoute.get('/home', (req, res) => {
  res.sendFile(`${config.PROJECT_ROOT}/public/index.html`);
});

mainRoute.get('/max-balance', (req, res) => {
  const controller = new MaxBalanceController();
  controller.get(req, res);
});

export default mainRoute;
