// eslint-disable-next-line import/no-extraneous-dependencies
import express from 'express';
import { MainController } from '../controllers/main.controller';
const mainRout = express.Router();

// root
mainRout.get('/', (req, res) => {
  const ctr = new MainController();
  ctr.getMaxChangedAccount(req, res);
});

mainRout.get('/test', (req, res) => {
  res.send('<h1 style="text-align: center; margin: 30vh 0;">test test test test</h1>');
});

export default mainRout;
