import express from 'express';
import { MaxBalanceController } from '../controllers/max-balance.controller';
const mainRoute = express.Router();

mainRoute.get('/', (req, res) => {
  res.sendFile(`${process.env.Project_ROOT}/static/index.html`);
});

mainRoute.get('/max-balance', (req, res) => {
  const controller = new MaxBalanceController();
  controller.get(req, res);
});

export default mainRoute;
