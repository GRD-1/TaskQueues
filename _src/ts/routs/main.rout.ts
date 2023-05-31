// eslint-disable-next-line import/no-extraneous-dependencies
import express from 'express';
import { MainController } from '../controllers/main.controller';
const mainRout = express.Router();

// root
mainRout.get('/', (req, res) => {
  const ctr = new MainController();
  ctr.getMaxChangedAccount(req, res);
});

export default mainRout;
