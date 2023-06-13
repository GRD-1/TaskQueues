import express from 'express';
import { MainController } from '../controllers/main.controller';
const mainRoute = express.Router();

mainRoute.get('/', (req, res) => {
  res.sendFile(`${process.env.Project_ROOT}/static/index.html`);
});

mainRoute.get('/max-balance', (req, res) => {
  const controller = new MainController();
  controller.get(req, res);
});

export default mainRoute;
