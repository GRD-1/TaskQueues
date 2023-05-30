// eslint-disable-next-line import/no-extraneous-dependencies
import express from 'express';
const mainRout = express.Router();

// root
mainRout.get('/', (req, res) => {
  res.send('<h1 style="text-align: center; margin: 30vh 0;">balance-rating project home page</h1>');
});

export default mainRout;
