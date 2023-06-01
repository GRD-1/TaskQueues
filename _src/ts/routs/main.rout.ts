// eslint-disable-next-line import/no-extraneous-dependencies
import express from 'express';
import { MainController } from '../controllers/main.controller';
const mainRout = express.Router();

// root
mainRout.get('/', (req, res) => {
  res.send(
    `<main style="text-align: center; margin: 30vh 0;"><h1>Главная страница приложения Balance-rating</h1>
        <br>чтобы получить адрес, баланс которого изменился больше остальных используйте запрос: http://localhost:3000/max-balance-acc
        <br>Источник данных ограничивает количество входящих запросов в мин. время выполнения запроса ~25сек. Наберитесь терпения
      </main>`,
  );
});

// root
mainRout.get('/max-balance-acc', (req, res) => {
  const ctr = new MainController();
  ctr.getMaxChangedAccount(req, res);
});

export default mainRout;
